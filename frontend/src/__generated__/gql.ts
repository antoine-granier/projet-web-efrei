/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query getChatById($chatId: String!) {\n    getChatById(chatId: $chatId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n": types.GetChatByIdDocument,
    "\n  mutation addMessageToChat(\n    $chatId: String!\n    $message: String!\n    $author: String!\n  ) {\n    addMessageToChat(chatId: $chatId, message: $message, author: $author)\n  }\n": types.AddMessageToChatDocument,
    "\n  mutation Login($email: String!, $password: String!) {\n    signIn(email: $email, password: $password) {\n      id\n      name\n      email\n      token\n    }\n  }\n": types.LoginDocument,
    "\n  mutation signUp($name: String!, $email: String!, $password: String!) {\n    signUp(name: $name, email: $email, password: $password) {\n      message\n      success\n    }\n  }\n": types.SignUpDocument,
    "\n  query getChatsByUser($userId: String!) {\n    getChatsByUser(userId: $userId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n": types.GetChatsByUserDocument,
    "\n  mutation createChat($userIds: [String!]!) {\n    createChat(userIds: $userIds) {\n      id\n      users {\n        id\n      }\n    }\n  }\n": types.CreateChatDocument,
    "\n  query getUsers {\n    getUsers {\n      id\n      name\n      email\n    }\n  }\n": types.GetUsersDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query getChatById($chatId: String!) {\n    getChatById(chatId: $chatId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query getChatById($chatId: String!) {\n    getChatById(chatId: $chatId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation addMessageToChat(\n    $chatId: String!\n    $message: String!\n    $author: String!\n  ) {\n    addMessageToChat(chatId: $chatId, message: $message, author: $author)\n  }\n"): (typeof documents)["\n  mutation addMessageToChat(\n    $chatId: String!\n    $message: String!\n    $author: String!\n  ) {\n    addMessageToChat(chatId: $chatId, message: $message, author: $author)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($email: String!, $password: String!) {\n    signIn(email: $email, password: $password) {\n      id\n      name\n      email\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation Login($email: String!, $password: String!) {\n    signIn(email: $email, password: $password) {\n      id\n      name\n      email\n      token\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation signUp($name: String!, $email: String!, $password: String!) {\n    signUp(name: $name, email: $email, password: $password) {\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation signUp($name: String!, $email: String!, $password: String!) {\n    signUp(name: $name, email: $email, password: $password) {\n      message\n      success\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query getChatsByUser($userId: String!) {\n    getChatsByUser(userId: $userId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query getChatsByUser($userId: String!) {\n    getChatsByUser(userId: $userId) {\n      id\n      users {\n        id\n        name\n      }\n      messages {\n        author {\n          id\n          email\n          name\n        }\n        content\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation createChat($userIds: [String!]!) {\n    createChat(userIds: $userIds) {\n      id\n      users {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createChat($userIds: [String!]!) {\n    createChat(userIds: $userIds) {\n      id\n      users {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query getUsers {\n    getUsers {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  query getUsers {\n    getUsers {\n      id\n      name\n      email\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;