const versions = [
    {
        version: 0,
        up: async (db: DB) => {
            // await db.execute(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)`);
            // console.log('db.insert', await db.insert(`INSERT INTO users (name, email) VALUES (?, ?)`,['Alice', 'alice@example.com']));
            // console.log('db.select', await db.select(`SELECT * FROM users`));
            // console.log('db.first', await db.first(`SELECT * FROM users`));
        }
    },
    {
        version:1,
        up: async (db: DB) => {
            await db.execute(`CREATE TABLE IF NOT EXISTS data_sound_tts (
                    id INTEGER PRIMARY KEY,

                    serverName TEXT,
                    serverTitle TEXT,
                    serverVersion TEXT,
                    text TEXT,
                    param TEXT,

                    status TEXT,
                    statusMsg TEXT,
                    jobResult TEXT,
                    startTime INTEGER,
                    endTime INTEGER,
                    resultWav TEXT
            )`);
            await db.execute(`CREATE TABLE IF NOT EXISTS data_sound_clone (
                    id INTEGER PRIMARY KEY,

                    serverName TEXT,
                    serverTitle TEXT,
                    serverVersion TEXT,
                    promptName TEXT,
                    promptWav TEXT,
                    promptText TEXT,
                    text TEXT,
                    param TEXT,

                    status TEXT,
                    statusMsg TEXT,
                    jobResult TEXT,
                    startTime INTEGER,
                    endTime INTEGER,
                    resultWav TEXT
            )`);
            await db.execute(`CREATE TABLE IF NOT EXISTS data_video_template (
                    id INTEGER PRIMARY KEY,

                    name TEXT,
                    video TEXT
            )`);
            await db.execute(`CREATE TABLE IF NOT EXISTS data_video_gen (
                    id INTEGER PRIMARY KEY,

                    serverName TEXT,
                    serverTitle TEXT,
                    serverVersion TEXT,
                    videoTemplateId INTEGER,
                    videoTemplateName TEXT,
                    soundType TEXT,
                    soundTtsId INTEGER,
                    soundTtsText TEXT,
                    soundCloneId INTEGER,
                    soundCloneText TEXT,

                    param TEXT,

                    status TEXT,
                    statusMsg TEXT,
                    jobResult TEXT,
                    startTime INTEGER,
                    endTime INTEGER,
                    resultMp4 TEXT
            )`);
        }
    },
    {
        version:2,
        up: async (db: DB) => {
            await db.execute(`ALTER TABLE data_sound_tts ADD COLUMN result TEXT`);
            await db.execute(`ALTER TABLE data_sound_clone ADD COLUMN result TEXT`);
            await db.execute(`ALTER TABLE data_video_gen ADD COLUMN result TEXT`);
        }
    },
    {
        version:3,
        up: async (db: DB) => {
            await db.execute(`ALTER TABLE data_video_gen ADD COLUMN soundCustomFile TEXT`);
        }
    },
]

export default {
    versions,
}


