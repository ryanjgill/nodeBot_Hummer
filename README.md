# NodeBot Rock Crawler
Using a LinkIt 7688 Duo to replace the internals of the new bright rc car and control it using websockets.

## This will use 2 PWM pins and 2 digital pins on the Raspberry Pi Zero W to control 2 dc motors. 
I connected 2 pins for each motor to an H bridge and use the Pi Zero W to control the flow of current based on each pin's value.

### Future Plans
Need to connect a second motor controller to control the turret. It will move on the x and y axis.
Also need to connect a relay to fire the turret.
