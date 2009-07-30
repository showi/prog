/*
 * ShoCstringToken.h
 *
 *  Created on: 2 juin 2009
 *      Author: sho
 */

#ifndef SHOCSTRINGTOKEN_H_
#define SHOCSTRINGTOKEN_H_

#include "ShoClinkedList.h"

struct string_token_ {
	unsigned char *pzString;
	unsigned int len;
	unsigned int pos;
};
typedef struct string_token_ string_token;

string_token* string_token_new (void);
void string_token_init(string_token* token);
void string_token_delete(string_token* token);
void string_token_pp (string_token* token);
shoc_ll_node* string_node_new(shoc_ll *list, unsigned int max);
void string_token_list_delete (shoc_ll* list);
shoc_ll* getprintable(unsigned char *data, unsigned int max);

#endif /* SHOCSTRINGTOKEN_H_ */
