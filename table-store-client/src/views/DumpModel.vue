<template>
  <Modal v-model="visible" fullscreen :closable="false" :title="title">
    <div style="height: 100%;width: 100%;">
      <Form :label-width="80">
        <FormItem label="下载目录">
          <Input placeholder="请选择下载目录" :value="dir" :readonly="true">
            <Button slot="append" @click.native="pickDir">选择</Button>
          </Input>
          <input style="visibility: hidden;" ref="file" type="file" placeholder="请选择下载目录" @change="dirSelected"
                 webkitdirectory/>
        </FormItem>
      </Form>
      <div id="messages_div" style="width: 100%;height: calc(100% - 100px); border: 1px solid red;overflow: auto">
        <template v-for="(msg,index) in messages">
          <div :key="index">{{msg.type}}{{msg.content}}</div>
        </template>
      </div>
    </div>
    <template slot="footer">
      <Button type="text" size="large" @click.native="visible=false" :disabled="downloading">取消</Button>
      <Button type="primary" size="large" :loading="downloading" @click.native="ok">导出</Button>
    </template>
  </Modal>
</template>

<script>
  const fs = require("fs");
  export default {
    name: "DumpModel",
    data() {
      return {
        visible: false,
        instance: null,
        dir: null,
        path: null,
        downloading: false,
        messages: []
      }
    },
    computed: {
      title() {
        if (!this.instance) return null;
        return "下载实例" + this.instance.conf.instancename;
      }
    },
    methods: {
      scrollMessages() {
        this.$nextTick(() => {
          const dom = document.getElementById("messages_div");
          dom.scrollTop = dom.scrollHeight;
        });
      },
      show(instance) {
        this.instance = instance;
        this.visible = true;
        this.downloading = false;
        this.messages = [];
      },
      pickDir() {
        this.$refs.file.click();
      },
      dirSelected(event) {
        // console.info(event);
        // console.info("element", event.srcElement);
        this.dir = event.target.files[0].path;
      },
      ok() {
        this.downloading = true;
        const instanceName = this.instance.conf.instancename;
        this.path = this.dir + "/" + instanceName;
        fs.exists(this.path, exists => {
          if (exists) {
            fs.rmdir(this.path, err => {
              if (err) {
                this.downloading = false;
                this.messages.push({type: "[ERROR]", content: err});
                this.scrollMessages();
                return;
              }
              fs.mkdir(this.path, err1 => {
                if (err1) {
                  this.downloading = false;
                  this.messages.push({type: "[ERROR]", content: err1});
                  this.scrollMessages();
                  return;
                }
                this.dump(0);
              });
            });
          } else {
            fs.mkdir(this.path, err => {
              if (err) {
                this.downloading = false;
                this.messages.push({type: "[ERROR]", content: err});
                this.scrollMessages();
                return;
              }
              this.dump(0);
            });
          }
        });
      },
      dump(index, meta, _from) {
        const len = this.instance.tables.length;
        if (index > len - 1) {
          this.downloading = false;
          this.messages.push({type: "[INFO]", content: "执行完成"});
          this.scrollMessages();
          return;
        }
        const conf = this.instance.conf;
        const table = this.instance.tables[index];
        if (!meta) {
          this.$ipc.request('describe-table', {conf: conf, tableName: table}, (err, data) => {
            if (err) {
              this.messages.push({type: "[ERROR]", content: err});
              this.downloading = false;
              this.scrollMessages();
              return
            }
            this.dump(index, data.table_meta);
          });
          return;
        }
        const request = {conf: conf, table: table, from: _from ? _from : null, meta: meta};
        if (!_from) {
          this.messages.push({type: "[INFO]", content: "开始导出表---[" + table + "]"});
          this.scrollMessages();
        }
        this.$ipc.request("dump-instance", request, (err, data) => {
          if (err) {
            this.messages.push({type: "[ERROR]", content: err});
            this.downloading = false;
            return
          }
          this.writeTo(table, data.rows, index, meta, data.next_start_primary_key);
        });
      },
      writeTo(table, rows, index, meta, next) {
        const path = this.path + "/" + table;
        const buffer = Buffer.from(JSON.stringify(rows));
        fs.exists(path, exist => {
          if (!exist) {
            fs.mkdir(path, err => {
              if (err) {
                this.messages.push({type: "[ERROR]", content: err});
                this.downloading = false;
                this.scrollMessages();
                return;
              }
              fs.writeFile(path + "/meta.json", Buffer.from(JSON.stringify(meta)), "UTF-8", metaErr => {
                if (metaErr) {
                  this.messages.push({type: "[ERROR]", content: metaErr});
                  this.downloading = false;
                  this.scrollMessages();
                  return;
                }
                fs.writeFile(path + "/" + this.$uuid() + ".json", buffer, "UTF-8", err1 => {
                  if (err1) {
                    this.messages.push({type: "[ERROR]", content: err1});
                    this.downloading = false;
                    this.scrollMessages();
                    return;
                  }
                  this.messages.push({type: "[INFO]", content: "表[" + table + "]导出[" + rows.length + "]条数据"});
                  this.scrollMessages();
                  if (next) {
                    this.dump(index, meta, next);
                  } else {
                    this.dump(index + 1);
                  }
                });
              });
            });
          } else {
            fs.writeFile(path + "/" + this.$uuid() + ".json", buffer, "UTF-8", err1 => {
              if (err1) {
                this.messages.push({type: "[ERROR]", content: err1});
                this.downloading = false;
                this.scrollMessages();
                return;
              }
              this.messages.push({type: "[INFO]", content: "表[" + table + "]导出[" + rows.length + "]条数据"});
              this.scrollMessages();
              if (next) {
                this.dump(index, meta, next);
              } else {
                this.messages.push({type: "[INFO]", content: "导出表完成---[" + table + "]"});
                this.scrollMessages();
                this.dump(index + 1);
              }
            });
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
