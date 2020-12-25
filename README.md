# fluid4node

Fluid synth bindings for node.

Install with: 

`npm i fluid4node`

See the file `test.js` for an example of how to use the library, once installed.

## Using the library

The default export of the library is a constructor that takes an optional `spec` object: 

```javascript
const f4n = require('fluid4node')({});
```

If you pass in an empty object, or nothing, the library will attempt to detect your operating system and configure itself accordingly.

## Using on ARM (for example: RPi) or Mac

The RPi can be ARM v6 or v7, each of which require a different build of `libfluidsynth`. You can install the correct binary build with your package manager, and pass the file path into the constructor.

On a Debian distro on RPi, you can use `dpkg -L libfluidsynth1` to get a list of all the files installed for `libfluidsynth` (use `apt install libfluidsynth1` to install it).

Find the path to the `libfluidsynth.so.1`, and pass this in as the value for `libs`, for example:

```javascript
const f4n = require('fluid4node')({
    libs: ['/usr/lib/arm-linux-gnueabihf/libfluidsynth.so.1'],
    drivers: ['alsa'],
    soundFonts: ['./sf2/Harmonium.sf2']
});
```

On a Mac, use `brew install fluidsynth`, then `brew list fluidsynth` to get the path to the `libfluidsynth.X.Y.Z.dylib` file:

```javascript
const f4n = require('fluid4node')({
    libs: ['/usr/local/Cellar/fluid-synth/2.1.5/lib/libfluidsynth.2.3.5.dylib'],
    drivers: ['coreaudio'],
    soundFonts: ['./sf2/Harmonium.sf2']
});
```

## Loading Sound Fonts 

The `soundFonts` argument to the constructor is an array of paths to sound fonts that will be loaded.

If you are looking for a sound font, try [General User](https://www.npmjs.com/package/generaluser).

## Setting a custom sample rate

You can pass a `sampleRate` to the API constructor, like this: 

```javascript
    const f4n = require('./dist/fluid4node.js')({
        sampleRate: 48000
    });
```

## Debugging

You can emit some debugging information by setting the environment variable `DEBUG=fluid4node`.