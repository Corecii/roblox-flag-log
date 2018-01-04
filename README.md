# roblox-flag-log
Logs changes to Roblox fast flags and other flags.

# Running

* Run `npm install` to install all required packages
* Run with `node .` with the directory open, or otherwise run node on the directory.

1. roblox-flag-log will create a `versions` directory if it does not exist
2. roblox-flag-log will run a GET request on the flag URLs
3. roblox-flag-log will create or update files with the same names inside `versions`
4. roblox-flag-log will print/log the git diff
5. roblox-flag-log will make a git commit with all of the files. If there are no changes, git ignores the commit
6. roblox-flag-log will repeat every hour
