# NodeBot Rock Crawler
Using a LinkIt 7688 Duo to replace the internals of the new bright rc car and control it using websockets.

## Node Modules
Node modules are currently being cross-built and copied over.
Using: socket-io johnny-five express

### This will use 2 PWM pins and 2 digital pins on the LinkIt 7688 Duo to control 2 dc motors. 
I connected 2 pins for each motor to an H bridge and use the tessel to control the flow of current based on each pin's value.
