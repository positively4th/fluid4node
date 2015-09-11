//#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "fluidsynth.h"

using namespace v8;

void Init(Handle<Object> exports, Handle<Object> module) {
  FluidSynth::Init(exports, module);
}

NODE_MODULE(fluid4node, Init)


