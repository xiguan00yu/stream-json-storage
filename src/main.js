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
          close();
          resolve(schema);
        }
      });
      rl.on("close", (schemaStr) => {
        resolve(null);
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

export default JsonStreamStorage

// (async () => {
//   console.log("===========");
//   const jss = new JsonStreamStorage();
//   for (let i = 0; i < 1_000_000; i++) {
//   console.log(
//     await jss.save({
//       id: Math.round(Math.random() * 100000),
//       // id: 888999,
//       age: Math.round(Math.random() * 100),
//       name: "abc",
//     })
//   );
//   }
//   console.log(
//     await jss.saveAll([
//       {
//         id: Math.round(Math.random() * 100000),
//         age: Math.round(Math.random() * 100),
//         name: "abc",
//       },
//       {
//         id: Math.round(Math.random() * 100000),
//         age: Math.round(Math.random() * 100),
//         name: "abc",
//       },
//       {
//         id: Math.round(Math.random() * 100000),
//         age: Math.round(Math.random() * 100),
//         name: "abc",
//       },
//     ])
//   );
//   console.log(await jss.find((obj) => obj.id === 8161000000));
//   console.log(await jss.findAll((obj) => obj.id === 8161, 1));
//   console.log(process.memoryUsage().heapUsed / 1024 / 1024);
//   console.log("===========");
// })();
