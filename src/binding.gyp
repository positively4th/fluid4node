{
    "targets": [
	{
	    "target_name": "fluid4node",
	    "conditions": [
		["OS=='linux'", {
		    "cflags" : [ "-std=c++11" ],
		    "ldflags": ["-Bstatic -lfluidsynth"]
		}
		]
	    ],
	    "sources": [ "fluid4node.cpp", "fluidsynth.h", "fluidsynth.cpp" ],
	    "libraries": ["/usr/lib/x86_64-linux-gnu/libfluidsynth.so.1"]
 	}
    ]
}
