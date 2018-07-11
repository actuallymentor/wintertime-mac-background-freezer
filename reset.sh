blacklistfile=$(<./blacklist)
blacklist=(  )

while read -r blacklistItem; do
    blacklist+=( "$blacklistItem" )
done <<< "$blacklistfile"

# Be verbose to the terminal
echo -e "\n\n-----\nExit task: Defrosting all apps in your blacklist\n-----\n"

# Wake up program
function defrost { 
	nameOfApp=$1
	echo "Defrosting $nameOfApp"
	pkill -CONT -u $(whoami) $nameOfApp
}

# Wake everything up
for item in "${blacklist[@]}"; do
	defrost $item
done

# I'm a sucker for whitespace
echo -e "\n"