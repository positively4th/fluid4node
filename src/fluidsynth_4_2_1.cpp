//#define BUILDING_NODE_EXTENSION
#include "fluidsynth_4_2_1.h"
#include <fluidsynth.h>

#include <string>
#include <node.h>

using namespace v8;
using namespace std;

Persistent<Function> FluidSynth::constructor;


FluidSynth::FluidSynth() : audioDriverMap() {
  this->settings = _settings(new_fluid_settings(), delete_fluid_settings);
  this->synth = _synth(new_fluid_synth(this->settings.get()), delete_fluid_synth);
  this->audioDriverMap = _int_ptr_map(new std::map<int, void *>());
}

FluidSynth::~FluidSynth() {
}

void FluidSynth::Init(Local<Object> exports, Local<Object> module) {
  Isolate* isolate = exports->GetIsolate();
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "Fluid"));
  tpl->InstanceTemplate()->SetInternalFieldCount(6);
  //Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "settings_setstr", FluidSynth::settings_setstr);
  NODE_SET_PROTOTYPE_METHOD(tpl, "synth_sfload", FluidSynth::synth_sfload);
  NODE_SET_PROTOTYPE_METHOD(tpl, "new_audio_driver", FluidSynth::new_audio_driver);
  NODE_SET_PROTOTYPE_METHOD(tpl, "synth_noteon", FluidSynth::synth_noteon);
  NODE_SET_PROTOTYPE_METHOD(tpl, "synth_noteoff", FluidSynth::synth_noteoff);
  NODE_SET_PROTOTYPE_METHOD(tpl, "synth_program_change", FluidSynth::synth_program_change);

  constructor.Reset(isolate, tpl->GetFunction());
  module->Set(String::NewFromUtf8(isolate, "exports"), tpl->GetFunction());
}

void FluidSynth::New(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();
  
  if (args.IsConstructCall()) {
    // Invoked as constructor: `new FluidSynth(...)`
    FluidSynth* obj = new FluidSynth();
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `FluidSynth(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void FluidSynth::settings_setstr(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();
 
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  v8::String::Utf8Value name(args[0]->ToString());
  v8::String::Utf8Value str(args[1]->ToString());

  args.GetReturnValue().Set(Number::New(isolate, fluid_settings_setstr(_this->settings.get(), std::string(*name).c_str(),
								       std::string(*str).c_str())));  
}

void FluidSynth::synth_sfload(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  v8::String::Utf8Value filename(args[0]->ToString());
  Local<Integer> reset = Integer::New(isolate, args[1]->IntegerValue());	
  Local<Integer> res = Integer::New(isolate, fluid_synth_sfload(_this->synth.get(), std::string(*filename).c_str(),
					     reset->IntegerValue()));  
  args.GetReturnValue().Set(res);
}

void FluidSynth::new_audio_driver(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  fluid_audio_driver_t *driver = new_fluid_audio_driver (_this->settings.get(), _this->synth.get());
  int key = _this->audioDriverMap->size() < 1 ? 0 : _this->audioDriverMap->end()->first + 1;
  (*_this->audioDriverMap)[key] = static_cast<void *>(driver);
  Local<Value> res = Integer::New(isolate, key);
  args.GetReturnValue().Set(res);	 
}

void FluidSynth::synth_noteon(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int key = args[1]->IntegerValue();	
  int vel = args[2]->IntegerValue();	
  Local<Value> res = Integer::New(isolate, fluid_synth_noteon(_this->synth.get(), chan, key, vel));	
  args.GetReturnValue().Set(res);	 
}

void FluidSynth::synth_noteoff(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();

  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int key = args[1]->IntegerValue();	
  Local<Value> res = Integer::New(isolate, fluid_synth_noteoff(_this->synth.get(), chan, key));	
  args.GetReturnValue().Set(res);	 
}

void FluidSynth::synth_program_change(const _v8args& args) {
  Isolate* isolate = args.GetIsolate();
  
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(args.This());
  int chan = args[0]->IntegerValue();	
  int prognum = args[1]->IntegerValue();	
  Local<Value> res = Integer::New(isolate, fluid_synth_program_change(_this->synth.get(), chan, prognum));	
  args.GetReturnValue().Set(res);	 
}


