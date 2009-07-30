/*
 * ShoCstringToken.c
 *
 *  Created on: 2 juin 2009
 *      Author: sho
 */
#include "ShoCstringToken.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "ShoCtypes.h"
#include "ShoCstr.h"

string_token* string_token_new (void) {
	string_token *token = malloc(sizeof(string_token));
	if (!token) {
		fprintf(stderr, "Cannot allocate memory for string token\n");
		return 0;
	}
	string_token_init(token);
	return token;
}

void string_token_init(string_token* token) {
	token->pzString = 0;
	token->len = 0;
	token->pos = 0;
}

void string_token_delete(string_token* token) {
	if (!token)
		return;
	//printf("Delete string token\n");
	if (token->pzString) {
		//printf("\tFree string\n");
		free(token->pzString);
		token->pzString = 0;
	}
	free(token);
	token = 0;
}

void string_token_list_delete (shoc_ll* list) {
	if (!list->pHead)
		return;
	shoc_ll_node *node = list->pHead;
	shoc_ll_node *next = 0;
	do {
		next = node->pNext;
		if (node->pData) {
			//printf("string_token_delete\n");
			string_token_delete((string_token*)node->pData);
		}
		//printf("Delete ll node\n");
		//shoc_ll_node_delete(node);
	} while((node = next));
	shoc_ll_delete(list);
}

void string_token_pp (string_token* token) {
	if (!token)
		return;
	printf("[%i] String token: %s (%i)\n", token->pos, token->pzString, token->len);
}

shoc_ll_node* string_node_new(shoc_ll *list, unsigned int max) {
	shoc_ll_node *node = shoc_ll_node_new();
	if (!node) {
		fprintf(stderr, "Error: string_node_new, cannot allocate memory for shoc_ll_node\n");
		return 0;
	}
	string_token *token = string_token_new();
	if (!token) {
		fprintf(stderr, "Error: getprintable, cannot allocate memory for string_token structure\n");
		shoc_ll_node_delete(list, node);
		return 0;
	}
	token->pzString = malloc(sizeof(unsigned char)*max);
	if (!token->pzString) {
		fprintf(stderr, "Error: getprintable, cannot allocate memory pzString in string_token structure\n");
		string_token_delete(token);
		shoc_ll_node_delete(list, node);
		return 0;
	}
	node->pData = (void*)token;
	return node;
}

shoc_ll* getprintable(unsigned char *data, unsigned int max) {
	shoc_ll *ll = shoc_ll_new();
	if (!ll)
		return 0;
	shoc_ll_node* node = string_node_new(ll, max);
	if (!node) {
		shoc_ll_delete(ll);
		return 0;
	}
	string_token* token = (string_token*)node->pData;
	int getp = 0;
	unsigned int token_pos = 0;
	unsigned int token_index = 0;
	int i;
	unsigned int len = strlen(data);
	for (i = 0; i <  len; i++) {
		//showAsciiCode(&data[i]);
		if (shoc_strisp(data[i])) {
			getp = 1;
			token->pzString[token_index] = data[i];
			token_index++;
		} else {
			if (token_pos >= SCRABBLE_MAXTOKEN - 1) {
				break;
			}
			if (getp) {
				token->pzString[token_index] = '\0';
				token->len = strlen(token->pzString);
				token->pos = token_pos;
				//string_token_pp(token);
				token_index = 0;
				token_pos++;
				shoc_ll_append(ll, node);
				node = string_node_new(ll, max);
				token = (string_token*)node->pData;
			}
		}
	}
	token->pzString[token_index] = '\0';
	token->len = strlen(token->pzString);
	token->pos = token_pos;
	//string_token_pp(token);
	if (!token->len) {
		string_token_delete(token);
		//string_token_list_delete(ll);
		return 0;
	}
	shoc_ll_append(ll, node);
	return ll;
}
