
#
# PS Move API - An interface for the PS Move Motion Controller
# Copyright (c) 2012 Thomas Perl <m@thp.io>
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#    1. Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#
#    2. Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#


import sys
import os
import time

import asyncio
import websockets
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'build'))

import psmove
import pygame

if psmove.count_connected() < 1:
    print('No controller connected')
    sys.exit(1)

tracker = psmove.PSMoveTracker()
move = psmove.PSMove()

# Mirror the camera image
tracker.set_mirror(True)

pygame.init()
display = pygame.display.set_mode((640, 480))

# Calibrate the controller with the tracker
result = -1
while result != psmove.Tracker_CALIBRATED:
    print('Trying to calibrate...')
    result = tracker.enable(move)

auto_update_leds = tracker.get_auto_update_leds(move)
print('Auto-update LEDs is', ('enabled' if auto_update_leds else 'disabled'))

# Loop and update the controller
REF_POINTS = [[0,0], [0,0], [0,0]]

async def serve(websocket, path):
    print('New client')
    MOVING = False
    TRIGGER_CHANGED = False
    TRIANGLE_CHANGED = False
    CIRCLE_CHANGED = False
    CROSS_CHANGED = False
    SQUARE_CHANGED = False
    MOVE_CHANGED = False

    TRIGGER_PRESSED = False
    TRIANGLE_PRESSED = False
    CIRCLE_PRESSED = False
    CROSS_PRESSED = False
    SQUARE_PRESSED = False
    MOVE_PRESSED = False
    while True:
        time.sleep(0.1)
        # Get the latest input report from the controller
        while move.poll():
            pressed, released = move.get_button_events()
            if move.get_trigger() > 10:
                if not TRIGGER_PRESSED:
                    TRIGGER_CHANGED = True
                TRIGGER_PRESSED = True
            else:
                if TRIGGER_PRESSED:
                    TRIGGER_CHANGED = True
                TRIGGER_PRESSED = False
            if pressed & psmove.Btn_TRIANGLE or released & psmove.Btn_TRIANGLE:
                TRIANGLE_CHANGED = True
                if pressed & psmove.Btn_TRIANGLE:
                    TRIANGLE_PRESSED = True
                if released & psmove.Btn_TRIANGLE:
                    TRIANGLE_PRESSED = False
            if pressed & psmove.Btn_CIRCLE or released & psmove.Btn_CIRCLE:
                CIRCLE_CHANGED = True
                if pressed & psmove.Btn_CIRCLE:
                    CIRCLE_PRESSED = True
                if released & psmove.Btn_CIRCLE:
                    CIRCLE_PRESSED = False
            if pressed & psmove.Btn_CROSS or released & psmove.Btn_CROSS:
                CROSS_CHANGED = True
                if pressed & psmove.Btn_CROSS:
                    CROSS_PRESSED = True
                if released & psmove.Btn_CROSS:
                    CROSS_PRESSED = False
            if pressed & psmove.Btn_SQUARE or released & psmove.Btn_SQUARE:
                SQUARE_CHANGED = True
                if pressed & psmove.Btn_SQUARE:
                    SQUARE_PRESSED = True
                if released & psmove.Btn_SQUARE:
                    SQUARE_PRESSED = False
            if pressed & psmove.Btn_MOVE or released & psmove.Btn_MOVE:
                MOVE_CHANGED = True
                if pressed & psmove.Btn_MOVE:
                    MOVE_PRESSED = True
                if released & psmove.Btn_MOVE:
                    MOVE_PRESSED = False


            
        # Grab the latest image from the camera
        tracker.update_image()
        # Update all tracked controllers
        tracker.update()
        status = tracker.get_status(move)

        # tracker.annotate()
        # image = tracker.get_image()
        # pixels = psmove.cdata(image.data, image.size).encode("utf-8", errors="surrogateescape")
        # surface = pygame.image.frombuffer(pixels, (image.width, image.height), 'RGB')
        # display.blit(surface, (0, 0))
        # pygame.display.flip()

        # Check button presses
        if status == psmove.Tracker_TRACKING:
            x, y, radius = tracker.get_position(move)
            transformedPoint = pool_transform([x,y])
            event = {
                'event': 'PRESS',
                'button': 'TRIGGER',
                'x': transformedPoint[0],
                'y': transformedPoint[1],
                'radius': radius,
            }
            if TRIGGER_CHANGED:
                if TRIGGER_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'TRIGGER'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                TRIGGER_CHANGED = False
            if CIRCLE_CHANGED:
                if CIRCLE_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'CIRCLE'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                CIRCLE_CHANGED = False
            if SQUARE_CHANGED:
                if SQUARE_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'SQUARE'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                SQUARE_CHANGED = False
            if TRIANGLE_CHANGED:
                if TRIANGLE_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'TRIANGLE'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                TRIANGLE_CHANGED = False
            if CROSS_CHANGED:
                if CROSS_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'CROSS'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                CROSS_CHANGED = False
            if MOVE_CHANGED:
                if MOVE_PRESSED:
                    event['event'] = 'PRESS'
                else:
                    event['event'] = 'RELEASE'
                event['button'] = 'MOVE'
                print('Sent event ' + json.dumps(event))
                await websocket.send(json.dumps(event))
                MOVE_CHANGED = False
                    

        # Check the tracking status        
        if status == psmove.Tracker_TRACKING:
            x, y, radius = tracker.get_position(move)
            transformedPoint = pool_transform([x,y])
            event = {
                'event': 'MOVE',
                'x': transformedPoint[0],
                'y': transformedPoint[1],
                'radius': radius,
            }
            print('Position: ({}, {}), Radius: {}, Trigger: {}'.format(
                    transformedPoint[0], transformedPoint[1], radius, move.get_trigger()))
            await websocket.send(json.dumps(event))
        elif status == psmove.Tracker_CALIBRATED:
            print('Not currently tracking.')
        elif status == psmove.Tracker_CALIBRATION_ERROR:
            print('Calibration error.')
        elif status == psmove.Tracker_NOT_CALIBRATED:
            print('Controller not calibrated.')

def start_calibration():
    CALIBRATING = True
    START_RELEASED = False
    i = 0
    while i < len(REF_POINTS):
        time.sleep(0.1)
        # Get the latest input report from the controller
        while move.poll():
            pressed, released = move.get_button_events()
            if released & psmove.Btn_START:
                START_RELEASED = True
                print("START_RELEASED")
            if pressed & psmove.Btn_START:
                print("START_pressed")
            if pressed & psmove.Btn_TRIANGLE:
                print("Btn_TRIANGLE_pressed")

        # Grab the latest image from the camera
        tracker.update_image()
        # Update all tracked controllers
        tracker.update()
        status = tracker.get_status(move)

        tracker.annotate()
        image = tracker.get_image()
        pixels = psmove.cdata(image.data, image.size).encode("utf-8", errors="surrogateescape")
        surface = pygame.image.frombuffer(pixels, (image.width, image.height), 'RGB')
        display.blit(surface, (0, 0))
        pygame.display.flip()
        
        if START_RELEASED:
            print("START RERLELALSADSED")
            if status == psmove.Tracker_TRACKING:
                x, y, radius = tracker.get_position(move)
                REF_POINTS[i] = [x,y] # left, down, right fron the user point of view
                print('Point ' + str(i) + ' : ' + str([x,y]))
                i += 1
                START_RELEASED = False
                continue
                
        # Check the tracking status
        
        if status == psmove.Tracker_CALIBRATED:
            print('Not currently tracking.')
        elif status == psmove.Tracker_CALIBRATION_ERROR:
            print('Calibration error.')
        elif status == psmove.Tracker_NOT_CALIBRATED:
            print('Controller not calibrated.')
    print("FINISHED CALIBRATION")
    print("Result: " + str(REF_POINTS))

def pool_transform(point):
    X0 = (REF_POINTS[0][0]+REF_POINTS[2][0])/2
    Y0 = (REF_POINTS[0][1]+REF_POINTS[2][1])/2
    x = point[0]-X0
    y = point[1]-Y0
    a = abs(REF_POINTS[2][0] - X0)
    b = abs(REF_POINTS[1][0] - Y0)
    return [-x/a, y/b]

start_calibration()
start_server = websockets.serve(serve, '0.0.0.0', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

# sudo LD_LIBRARY_PATH=~/github/tsunami-tracker python3 tsunami_tracker.py