//#define BUILDING_NODE_EXTENSION
#include "fluidsynth.h"
#include <fluidsynth.h>

#include <string>
#include <node.h>

using namespace v8;
using namespace std;

Persistent<Function> FluidSynth::constructor;


FluidSynth::FluidSynth() : audioDriverMap() {
  this->settings = _settings(new_fluid_settings(), delete_fluid_settings);
  this->synth = _synth(new_fluid_synth(this->settings.get()), delete_fluid_synth);
  this->audioDriverMap = _ptr_map(new std::map<int, void *>());
}

FluidSynth::~FluidSynth() {
}


Handle<Value> FluidSynth::settings_setstr(const Arguments& args) {
  HandleScope scope;

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  v8::String::Utf8Value name(args[0]->ToString());
  v8::String::Utf8Value str(args[1]->ToString());
  Local<Number> res = Number::New(fluid_settings_setstr(_this->settings.get(), std::string(*name).c_str(),
							std::string(*str).c_str()));  
  return scope.Close(res);	 
}

Handle<Value> FluidSynth::synth_sfload(const Arguments& args) {
  HandleScope scope;

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  v8::String::Utf8Value filename(args[0]->ToString());
  Local<Integer> reset = Integer::New(args[1]->IntegerValue());	
  Local<Integer> res = Integer::New(fluid_synth_sfload(_this->synth.get(), std::string(*filename).c_str(),
					     reset->IntegerValue()));  
  return scope.Close(res);	 

}

Handle<Value> FluidSynth::new_audio_driver(const v8::Arguments& args) {
  HandleScope scope;

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  fluid_audio_driver_t *driver = new_fluid_audio_driver (_this->settings.get(), _this->synth.get());
  int key = _this->audioDriverMap->size() < 1 ? 0 : _this->audioDriverMap->end()->first + 1;
  (*_this->audioDriverMap)[key] = static_cast<void *>(driver);
  Local<Value> res = Integer::New(key);
  return scope.Close(res);	 
  
}

Handle<Value> FluidSynth::synth_noteon(const Arguments& args) {
  HandleScope scope;

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int key = args[1]->IntegerValue();	
  int vel = args[2]->IntegerValue();	
  Local<Value> res = Integer::New(fluid_synth_noteon(_this->synth.get(), chan, key, vel));	
  return scope.Close(res);	 

}

Handle<Value> FluidSynth::synth_noteoff(const Arguments& args) {
  HandleScope scope;

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int key = args[1]->IntegerValue();	
  Local<Value> res = Integer::New(fluid_synth_noteoff(_this->synth.get(), chan, key));	
  return scope.Close(res);	 

}

Handle<Value> FluidSynth::synth_program_change(const Arguments& args) {
  HandleScope scope;
  
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int prognum = args[1]->IntegerValue();	
  Local<Value> res = Integer::New(fluid_synth_program_change(_this->synth.get(), chan, prognum));	
  return scope.Close(res);	 
}



void FluidSynth::Init(Handle<Object> exports, Handle<Object> module) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("FluidSynth"));
  tpl->InstanceTemplate()->SetInternalFieldCount(6);
  //Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("settings_setstr"),
				FunctionTemplate::New(FluidSynth::settings_setstr)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("synth_sfload"),
				FunctionTemplate::New(FluidSynth::synth_sfload)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("new_audio_driver"),
				FunctionTemplate::New(FluidSynth::new_audio_driver)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("synth_noteon"),
				FunctionTemplate::New(FluidSynth::synth_noteon)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("synth_noteoff"),
				FunctionTemplate::New(FluidSynth::synth_noteoff)->GetFunction());
  tpl->PrototypeTemplate()->Set(String::NewSymbol("synth_program_change"),
				FunctionTemplate::New(FluidSynth::synth_program_change)->GetFunction());
  constructor = Persistent<Function>::New(tpl->GetFunction());
  //  exports->Set(String::NewSymbol("Fluid"), constructor);
  module->Set(String::NewSymbol("exports"), constructor);
}

Handle<Value> FluidSynth::New(const Arguments& args) {
  HandleScope scope;

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new FluidSynth(...)`
    FluidSynth* obj = new FluidSynth();
    obj->Wrap(args.This());
    return args.This();
  } else {
    // Invoked as plain function `FluidSynth(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    return scope.Close(constructor->NewInstance(argc, argv));
  }
}

