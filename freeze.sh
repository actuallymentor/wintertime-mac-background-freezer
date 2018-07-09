# Read blacklist
blacklistfile=$(<./blacklist)
blacklist=(  )

echo -e "\nBlacklist:"
printf '%s\n' "${blacklist[@]}"

while read -r blacklistItem; do
    blacklist+=( "$blacklistItem" )
done <<< "$blacklistfile"

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
	killall -STOP $nameOfApp
}

# Wake up program
function defrost { 
	nameOfApp=$1
	echo "Defrosting $nameOfApp"
	killall -CONT $nameOfApp
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