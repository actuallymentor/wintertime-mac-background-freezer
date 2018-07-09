# Mac Freeze Background Apps

This script freezes processes that are not in focus (foreground). I use it to freeze applications like internet browsers and electron based applications from eating my battery.

## Usage

Step 1: start by cloning this repository:

```bash
git clone https://github.com/actuallymentor/mac-freeze-background.git
```

Step 2: the script reads the `blacklist` file. Add names of programs you want to freeze to this file.

Step 3: start the script when you want to freeze applications by running `bash ./freeze.sh` while inside the directory that you cloned this repository to.

Exit instructions: when you want to stop freezing apps, exit the script with ctrl+C. It will automatically defrost the apps currently frozen.

## Wishlist

Ideally I will spend some time to:

- Create an option to `whitelist` instead of blacklist
- Create an option to freeze any background process using over x% CPU
- Make a daemon out of this and add it to `brew`

If you have time to tackle the above pull requests are welcome.