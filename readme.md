# Instructions:

## OSX
Install the latest versions ofl:
* node: https://nodejs.org/es/download/
* brew: https://docs.brew.sh/Installation


### (1/4) Installation
Then run 
```
   python3 -m venv py3env
   source py3env/bin/activate
   sh osx-install.sh
```
### (2/4) Pairing

To pair the controller with your computer, plug it to the USB and run:
```
sudo DYLD_LIBRARY_PATH=. ./psmove pair
```
Then unplug it, turn on bluetooth and press the PS Button until it is ready.
If requested for a PIN, close the dialog and repeat the process.

### (3/4) Calibration 
```
sudo DYLD_LIBRARY_PATH=. python3 tsunami_tracker.py
```

When you see the camera image point the PS move purple ball and press START without leaving the image field of view to YOUR left, up and right. 

### (4/4) Running
Run 
```
   python3 -m http.server
```
And open Chrome at ´localhost:8000/client´

### Final notice
* Every python command must be run under the virtualenv, so make sure there is  a "(py3env)" at the beginning of your command prompt. If not, run `source py3env/bin/activate` again, or go to the installation (step 1).
* If you get an `adress already in use` error, it means you already run step 4 before. You can either stop the terminal where you setup the localhost, or specify a different port such as 8001 by running
```
python3 -m http.server 8001
```
and then open it at `localhost:8001/client`

## Linux
libsdl-dev libsdl-image1.2-dev libsdl-mixer1.2-dev libsdl-ttf2.0-dev libsmpeg-dev libportmidi-dev libavformat-dev libswscale-dev python3-dev python3-numpy


