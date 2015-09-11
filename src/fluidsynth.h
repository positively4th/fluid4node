#ifndef FLUIDSYNTH_H
#define FLUIDSYNTH_H

#include <map>
#include <memory>
#include <node.h>
#include <fluidsynth.h>

using namespace std;


class FluidSynth : public node::ObjectWrap {
 public:
  typedef shared_ptr<fluid_settings_t> _settings;
  typedef shared_ptr<fluid_synth_t> _synth; 
  typedef shared_ptr<std::map<int, void *> > _int_ptr_map; 
  typedef shared_ptr<std::map<int, int> > _int_int_map; 
 protected:
  explicit FluidSynth();
  ~FluidSynth();
  _settings settings;
  _synth synth;
  _int_ptr_map audioDriverMap; 	
  static v8::Handle<v8::Value> settings_setstr(const v8::Arguments& args);
  static v8::Handle<v8::Value> synth_sfload(const v8::Arguments& args);	
  static v8::Handle<v8::Value> new_audio_driver(const v8::Arguments& args);   
  
  static v8::Handle<v8::Value> synth_noteon(const v8::Arguments& args);
  static v8::Handle<v8::Value> synth_noteoff(const v8::Arguments& args);
  static v8::Handle<v8::Value> synth_program_change(const v8::Arguments& args);

    
  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Persistent<v8::Function> constructor;
 public:
  static void Init(v8::Handle<v8::Object> exports, v8::Handle<v8::Object> module);

};

#endif
