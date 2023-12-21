/**
 * @typedef {import('protobufjs').Root} Root
 * @typedef {import('protobufjs').Message} Message
 */
/**
 * Get Protobuf.js Root object from the serialized FileDescriptorProto messages
 * that gotten from reflection service.
 * @param {Array<Uint8Array|string>|undefined} file_descriptor_protos - Reflection descriptor protos
 * @return {Root} Protobuf.js Root object
 */
export function getDescriptorRoot(file_descriptor_protos: Array<Uint8Array | string> | undefined): Root;
/**
 * Get Protobuf.js Root object from FileDescriptorSet
 * @param {Message file_descriptor_set - File descriptor set
 * @return {Root} Protobuf.js Root object
 */
export function getDescriptorRootFromDescriptorSet(file_descriptor_set: Message): Root;
export type Root = import("protobufjs").Root;
export type Message = import("protobufjs").Message<object>;
