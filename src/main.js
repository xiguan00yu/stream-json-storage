import { createReadStream, exists, promises } from "fs";
import * as readline from "readline";

class JsonStreamStorage {
  loaded = false;
  storagePath = "data.json";
  endOperator = "\n";

  // 1. create file
  // 2. DAO layer
  constructor(path) {
    // create file use path
    this.storagePath = path || this.storagePath;
    // check file exist:
    //  if true, jump and change loaded flag
    //  if false, create file and change loaded flag
    exists(this.storagePath, (isExists) => {
      if (isExists) return (this.loaded = true);
      // create file
      promises
        .writeFile(this.storagePath, "")
        .then(() => {
          // create success
          this.loaded = true;
        })
        .catch(() => {
          // create fail
          // :TODO
        });
    });
  }

  // find -> predicate(schema):bool
  find(predicate) {
    return new Promise((resolve) => {
      let findflag = false;
      const rl = readline.createInterface({
        input: createReadStream(this.storagePath),
      });
      const close = () => {
        rl.close();
        rl.removeAllListeners();
      };
      rl.on("line", (schemaStr) => {
        const schema = JSON.parse(schemaStr);
        if (predicate(schema)) {
          findflag = true;
          close();
          resolve(schema);
        }
      });
      rl.on("close", () => {
        !findflag && resolve(null);
      });
    });
  }
  // findAll -> predicate(schema):bool, limit: false or number
  findAll(predicate, limit = false) {
    return new Promise((resolve) => {
      const response = [];
      const rl = readline.createInterface({
        input: createReadStream(this.storagePath),
      });
      const close = () => {
        rl.close();
        rl.removeAllListeners();
      };
      rl.on("line", (schemaStr) => {
        const schema = JSON.parse(schemaStr);
        if (predicate(schema)) {
          response.push(schema);
        }
        if (limit !== false && response.length >= limit) {
          close();
        }
      });
      rl.on("close", () => {
        resolve(response);
      });
    });
  }
  // save -> schema: string or object
  async save(schema) {
    schema = typeof schema === "string" ? schema : JSON.stringify(schema);
    schema = schema.endsWith(this.endOperator)
      ? schema
      : `${schema}${this.endOperator}`;
    return promises.appendFile(this.storagePath, schema);
  }
  // saveAll -> schemas: string[] or object[]
  async saveAll(schemas) {
    schemas = Array.isArray(schemas) ? schemas : [schemas];
    schemas = schemas
      .map((schema) =>
        typeof schema === "string" ? schema : JSON.stringify(schema)
      )
      .map((schema) =>
        schema.endsWith(this.endOperator)
          ? schema
          : `${schema}${this.endOperator}`
      );
    return promises.appendFile(this.storagePath, schemas);
  }
}

export default JsonStreamStorage;
