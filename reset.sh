blacklistfile=$(<./blacklist)
blacklist=(  )

while read -r blacklistItem; do
    blacklist+=( "$blacklistItem" )
done <<< "$blacklistfile"

# Wake up program
function defrost { 
	nameOfApp=$1
	echo "Defrosting $nameOfApp"
	killall -v -CONT $nameOfApp
}

# Wake everything up
for item in "${blacklist[@]}"; do
	defrost $item
done