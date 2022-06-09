# stream-json-storage

> This repository is a stream access to the local file storage tool library.

### Install


    npm install stream-json-storage

### Use

- Create

    
        const jss = new JsonStreamStorage(/** data path */);

- Find

        const result = await jss.find(/** find function by obj field */)

- Save

        await jss.save({ /** obj field ... */ })