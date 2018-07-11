# If the sc ript is cancelled, reset everything
trap 'bash ./reset.sh; exit 0;' 1 2 3 6

# Manual
echo -e "\nThis script will freeze the processes in the blacklist file when they are not in focus. When you exit the script using ctrl+C all applications in the blacklist are defrosted.\n"

# Read blacklist
blacklistfile=$(<./blacklist)
blacklist=()

while read -r blacklistItem; do
    blacklist+=( "$blacklistItem" )
done <<< "$blacklistfile"

echo -e "\nBlacklist:\n---------\n"
printf '%s\n' "${blacklist[@]}"
echo -e "\n"

# Placeholder for current window
currentWindow=''

# Use appliscript to grab the title of the current window
function findCurrentWindow { 
	currentWindow="$( osascript -e 'tell application "System Events"' \
				  -e 'set frontApp to name of first application process whose frontmost is true' \
				  -e 'end tell')"
}

# Make a program freeze
function freeze { 
	nameOfApp=$1
	pkill -STOP -u $(whoami) $nameOfApp
}

# Wake up program
function defrost { 
	nameOfApp=$1
	pkill -CONT -u $(whoami) $nameOfApp
}

## Find blacklisted apps and freeze them

# Make sleepers sleep
function freezeManager { 

	findCurrentWindow
	doNotFreeze=$currentWindow

	doFreeze=()

	for sleeper in "${blacklist[@]}"; do
		if [[ $sleeper != $currentWindow ]] 
		then
			doFreeze+=( "${sleeper}" )
		fi
	done

	for sleeper in "${doFreeze[@]}"; do
		freeze $sleeper
	done

	for wakeup in "${doNotFreeze}"; do
		defrost $wakeup
	done

	
}

# Run the freeze manager every second
while true; do freezeManager; sleep 1; done;