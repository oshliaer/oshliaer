## ⚠ firestore: Port 8080 is not open on localhost, could not start Firestore Emulator

### List the processes

```sh
~ lsof -i :8080
```

### Kill the processes

```sh
 lsof -i :8080 | awk '$1=="java"' | tr -s ' ' | cut -d ' ' -f2 | xargs kill &&\
 lsof -i :9000 | awk '$1=="java"' | tr -s ' ' | cut -d ' ' -f2 | xargs kill
```

### Full error message

```sh
> firebase emulators:start --only functions,database,firestore,pubsub,storage

i  emulators: Starting emulators: functions, firestore, database, pubsub, storage
⚠  hub: emulator hub unable to start on port 4400, starting on 4401 instead.
⚠  emulators: It seems that you are running multiple instances of the emulator suite for project my-firebase-app. This may result in unexpected behavior.
i  emulators: Shutting down emulators.
i  hub: Stopping emulator hub
⚠  functions: Port 8080 is not open on localhost, could not start Functions Emulator.
⚠  functions: To select a different host/port, specify that host/port in a firebase.json config file:
      {
        // ...
        "emulators": {
          "functions": {
            "host": "HOST",
            "port": "PORT"
          }
        }
      }
i  emulators: Shutting down emulators.

Error: Could not start Functions Emulator, port taken.
The terminal process "zsh '-c', 'npm run 'start emulators *nix''" terminated with exit code: 1.

Terminal will be reused by tasks, press any key to close it.
```
