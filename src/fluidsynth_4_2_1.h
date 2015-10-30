#ifndef FLUIDSYNTH_H
#define FLUIDSYNTH_H

#include <map>
#include <memory>
#include <node.h>
#include <node_object_wrap.h>
#include <fluidsynth.h>

using namespace std;


class FluidSynth : public node::ObjectWrap {
 public:
  typedef shared_ptr<fluid_settings_t> _settings;
  typedef shared_ptr<fluid_synth_t> _synth; 
  typedef shared_ptr<std::map<int, void *> > _int_ptr_map; 
  typedef shared_ptr<std::map<int, int> > _int_int_map; 
  typedef v8::FunctionCallbackInfo<v8::Value> _v8args;
 protected:
  explicit FluidSynth();
  ~FluidSynth();
  _settings settings;
  _synth synth;
  _int_ptr_map audioDriverMap; 	
  static void settings_setstr(const _v8args& args);
  static void synth_sfload(const _v8args& args);	
  static void new_audio_driver(const _v8args& args);   
  
  static void synth_noteon(const _v8args& args);
  static void synth_noteoff(const _v8args& args);
  static void synth_program_change(const _v8args& args);

    
  static void New(const _v8args& args);
  static v8::Persistent<v8::Function> constructor;
 public:
  static void Init(v8::Local<v8::Object> exports, v8::Local<v8::Object> module);

};

#endif
