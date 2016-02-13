#To get it working on Windows (10?) Visual Studio (2015?) copy the
#libfluidsynth.dll to build/Release folder!

{
 "variables": {
      "srcdir": ">(PRODUCT_DIR)/../..",
      "dlldir": ">(PRODUCT_DIR)/../../3rdp"
  },
  "targets": [
	{
	    "target_name": "fluid4node",
	    "conditions": [
		["OS=='win'", {
	 		      "msvs_settings": {
              		      		       "VCLinkerTool": {
                			       		       "AdditionalLibraryDirectories": ['<(dlldir)'],
							       }
				},
	      			"link_settings": {
                  				 "libraries": ["-lfluidsynth"]		     
						 }
				},
		"OS=='linux'", {
		    "cflags" : [ "-std=c++11" ],
		    "ldflags": ["-Bstatic -lfluidsynth"],
		    "libraries": ["/usr/lib/x86_64-linux-gnu/libfluidsynth.so.1"]
		}
		]		
	    ],
	    "sources": [ "fluid4node.cpp", "synth.h", "synth.cpp" ],
	    "include_dirs" : [
	    	"<!(node -e \"require('nan')\")",
		"<(srcdir)/3rdp"
	    ]
 	}
    ]
}
