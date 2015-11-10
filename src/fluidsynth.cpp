//#define BUILDING_NODE_EXTENSION
#include "fluidsynth.h"
#include <fluidsynth.h>

#include <string>
#include <node.h>

using namespace std;

Nan::Persistent<v8::Function> FluidSynth::constructor;


FluidSynth::FluidSynth() : audioDriverMap() {
  this->settings = _settings(new_fluid_settings(), delete_fluid_settings);
  this->synth = _synth(new_fluid_synth(this->settings.get()), delete_fluid_synth);
  this->audioDriverMap = _int_ptr_map(new std::map<int, void *>());
}

FluidSynth::~FluidSynth() {
}

void FluidSynth::Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module) {
  Nan::HandleScope scope;

  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  v8::Local<v8::String> className = Nan::New("Fluid").ToLocalChecked();
  tpl->SetClassName(className);
  tpl->InstanceTemplate()->SetInternalFieldCount(6);
  //Prototype
  Nan::SetPrototypeMethod(tpl, "settings_setstr", FluidSynth::settings_setstr);
  Nan::SetPrototypeMethod(tpl, "synth_sfload", FluidSynth::synth_sfload);
  Nan::SetPrototypeMethod(tpl, "new_audio_driver", FluidSynth::new_audio_driver);
  Nan::SetPrototypeMethod(tpl, "synth_noteon", FluidSynth::synth_noteon);
  Nan::SetPrototypeMethod(tpl, "synth_noteoff", FluidSynth::synth_noteoff);
  Nan::SetPrototypeMethod(tpl, "synth_program_change", FluidSynth::synth_program_change);

  constructor.Reset(tpl->GetFunction());
  v8::Local<v8::String> xkey = Nan::New("exports").ToLocalChecked();
  module->Set(xkey, tpl->GetFunction());
}

NAN_METHOD(FluidSynth::New) {
  if (info.IsConstructCall()) {
    // Invoked as constructor: `new FluidSynth(...)`
    FluidSynth* obj = new FluidSynth();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    // Invoked as plain function `FluidSynth(...)`, turn into construct call.
    const int argc = 1;
    v8::Local<v8::Value> argv[argc] = { info[0] };
    
    v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
    info.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

NAN_METHOD(FluidSynth::settings_setstr) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  v8::String::Utf8Value name(info[0]->ToString());
  v8::String::Utf8Value str(info[1]->ToString());

  info.GetReturnValue().Set(Nan::New<v8::Number>(fluid_settings_setstr(_this->settings.get(), std::string(*name).c_str(),
								       std::string(*str).c_str())));  
}

NAN_METHOD(FluidSynth::synth_sfload) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  v8::String::Utf8Value filename(info[0]->ToString());
  v8::Local<v8::Integer> res = Nan::New<v8::Integer>(fluid_synth_sfload(_this->synth.get(), std::string(*filename).c_str(),
								info[1]->IntegerValue()));  
  info.GetReturnValue().Set(res);
}

NAN_METHOD(FluidSynth::new_audio_driver) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  fluid_audio_driver_t *driver = new_fluid_audio_driver (_this->settings.get(), _this->synth.get());
  int key = _this->audioDriverMap->size() < 1 ? 0 : _this->audioDriverMap->end()->first + 1;
  (*_this->audioDriverMap)[key] = static_cast<void *>(driver);
  v8::Local<v8::Value> res = Nan::New<v8::Integer>(key);
  info.GetReturnValue().Set(res);	 
}

NAN_METHOD(FluidSynth::synth_noteon) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  int chan = info[0]->IntegerValue();	
  int key = info[1]->IntegerValue();	
  int vel = info[2]->IntegerValue();	
  v8::Local<v8::Value> res = Nan::New<v8::Integer>(fluid_synth_noteon(_this->synth.get(), chan, key, vel));	
  info.GetReturnValue().Set(res);	 
}

NAN_METHOD(FluidSynth::synth_noteoff) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  int chan = info[0]->IntegerValue();	
  int key = info[1]->IntegerValue();	
  v8::Local<v8::Value> res = Nan::New<v8::Integer>(fluid_synth_noteoff(_this->synth.get(), chan, key));	
  info.GetReturnValue().Set(res);	 
}

NAN_METHOD(FluidSynth::synth_program_change) {
  FluidSynth* _this = ObjectWrap::Unwrap<FluidSynth>(info.This());
  int chan = info[0]->IntegerValue();	
  int prognum = info[1]->IntegerValue();	
  v8::Local<v8::Value> res = Nan::New<v8::Integer>(fluid_synth_program_change(_this->synth.get(), chan, prognum));	
  info.GetReturnValue().Set(res);	 
}


