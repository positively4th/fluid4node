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
	    "sources": [ "fluid4node_4_2_1.cpp", "fluidsynth_4_2_1.h", "fluidsynth_4_2_1.cpp" ],
	    "libraries": ["/usr/lib/x86_64-linux-gnu/libfluidsynth.so.1"]
 	}
    ]
}
