source py3env/bin/activate
sudo DYLD_LIBRARY_PATH=. ./psmove pair
sudo DYLD_LIBRARY_PATH=. python3 tsunami_tracker.py &
python3 -m http.server
