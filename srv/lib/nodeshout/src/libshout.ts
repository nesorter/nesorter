// @ts-nocheck

import {Library} from 'ffi-napi';
import {refType, types} from 'ref-napi';

var voidPtr = refType(types.void);

var shout_t = voidPtr;
var shout_tPtr = refType(shout_t);
var shout_metadata_t = voidPtr;
var shout_metadata_tPtr = refType(shout_metadata_t);

export default Library('libshout', {
    shout_init: [types.void, []],
    shout_shutdown: [types.void, []],
    shout_version: [types.CString, [
        refType(types.int32),
        refType(types.int32),
        refType(types.int32),
    ]],
    shout_new: [shout_t, []],
    shout_free: [types.void, [shout_tPtr]],
    shout_get_error: [types.CString, [shout_tPtr]],
    shout_get_errno: [types.int32, [shout_tPtr]],
    shout_get_connected: [types.int32, [shout_tPtr]],
    shout_set_host: [types.int32, [shout_tPtr, types.CString]],
    shout_get_host: [types.CString, [shout_tPtr]],
    shout_set_port: [types.int32, [shout_tPtr, types.ushort]],
    shout_get_port: [types.ushort, [shout_tPtr]],
    shout_set_password: [types.int32, [shout_tPtr, types.CString]],
    shout_get_password: [types.CString, [shout_tPtr]],
    shout_set_mount: [types.int32, [shout_tPtr, types.CString]],
    shout_get_mount: [types.CString, [shout_tPtr]],
    shout_set_name: [types.int32, [shout_tPtr, types.CString]],
    shout_get_name: [types.CString, [shout_tPtr]],
    shout_set_url: [types.int32, [shout_tPtr, types.CString]],
    shout_get_url: [types.CString, [shout_tPtr]],
    shout_set_genre: [types.int32, [shout_tPtr, types.CString]],
    shout_get_genre: [types.CString, [shout_tPtr]],
    shout_set_user: [types.int32, [shout_tPtr, types.CString]],
    shout_get_user: [types.CString, [shout_tPtr]],
    shout_set_agent: [types.int32, [shout_tPtr, types.CString]],
    shout_get_agent: [types.CString, [shout_tPtr]],
    shout_set_description: [types.int32, [shout_tPtr, types.CString]],
    shout_get_description: [types.CString, [shout_tPtr]],
    shout_set_dumpfile: [types.int32, [shout_tPtr, types.CString]],
    shout_get_dumpfile: [types.CString, [shout_tPtr]],
    shout_set_audio_info: [types.int32, [shout_tPtr, types.CString, types.CString]],
    shout_get_audio_info: [types.CString, [shout_tPtr, types.CString]],
    shout_set_public: [types.int32, [shout_tPtr, types.uint32]],
    shout_get_public: [types.uint32, [shout_tPtr]],
    shout_set_format: [types.int32, [shout_tPtr, types.uint32]],
    shout_get_format: [types.uint32, [shout_tPtr]],
    shout_set_protocol: [types.int32, [shout_tPtr, types.uint32]],
    shout_get_protocol: [types.uint32, [shout_tPtr]],
    shout_set_nonblocking: [types.int32, [shout_tPtr, types.uint32]],
    shout_get_nonblocking: [types.uint32, [shout_tPtr]],
    shout_open: [types.int32, [shout_tPtr]],
    shout_close: [types.int32, [shout_tPtr]],
    shout_send: [types.int32, [shout_tPtr, refType(types.uchar), types.int32]],
    shout_send_raw: [types.int32, [shout_tPtr, refType(types.uchar),  types.int32]],
    shout_queuelen: [types.int32, [shout_tPtr]],
    shout_sync: [types.void, [shout_tPtr]],
    shout_delay: [types.int32, [shout_tPtr]],
    shout_set_metadata: [types.int32, [shout_tPtr, shout_metadata_t]],
    shout_metadata_new: [shout_metadata_tPtr, []],
    shout_metadata_free: [types.void, [shout_metadata_tPtr]],
    shout_metadata_add: [types.int32, [shout_metadata_tPtr, types.CString, types.CString]],
});
