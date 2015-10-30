//#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "fluidsynth_4_2_1.h"

using namespace v8;
 void Init(Handle<Object> exports,  Local<Object> module) {
   FluidSynth::Init(exports, module);
}

NODE_MODULE(fluid4node, Init)


