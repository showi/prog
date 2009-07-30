/*
 * Node.h
 *
 *  Created on: 24 mai 2009
 *      Author: sho
 */

#ifndef SHODICLEXNODE_H_
#define SHODICLEXNODE_H_

#include "ShoCtypes.h"
#include "ShoClinkedList.h"

struct diclexNode_ {
	myBool bIsTerminal;
	unsigned char iChar;
	struct diclexNode_ *pParent;
	shoc_ll *pChilds;
};
typedef struct diclexNode_ diclexNode;

struct diclex_ {
	diclexNode *pRoot;
	unsigned long int iNodeNum;
	unsigned long int iNumWord;
	unsigned char *pCharSet;
};
typedef struct diclex_ diclex;

// unused structure
struct diclexWord_ {
	unsigned char *pzString;
	unsigned int len;
};
typedef struct diclexWord_ diclexWord;

struct diclexWordList_ {
	shoc_ll *pWordList;
	unsigned char *longest;
};
typedef struct diclexWordList_ diclexWordList;

#define SHOCDICLEX_WORDMAXLEN 128

diclex* shoc_diclex_new(void);
void shoc_diclex_delete(diclex*);
void shoc_diclex_setCharSet(diclex* p_pDicLex, unsigned char* p_pzCharSet);
void shoc_diclex_printstats(diclex*);
diclexNode* shoc_diclexNode_new(void);
void shoc_diclexNode_delete(diclexNode*);
diclexNode* shoc_diclex_addChild(diclex* p_pDicLex, diclexNode* root, const unsigned char*, myBool bTerminal);
void shoc_diclex_addWord(diclex* p_pDicLex, diclexNode* root, const unsigned char* p_pzWord, unsigned int pos, unsigned int len);
diclexNode* shoc_diclex_childExist(diclexNode* node, const unsigned char *p_iC,  const myBool p_bTerminal);
void shoc_diclex_loadFile(diclex* p_pDicLex, diclexNode* node, const char *p_pzFilename, unsigned int wordlen);
void shoc_diclex_dump(diclexNode*, unsigned int lvl);
void shoc_diclex_dumpNode(diclexNode*,unsigned int lvl);
myBool shoc_diclex_match(diclexNode*,unsigned char *search, unsigned int pos, unsigned int len);
myBool shoc_diclex_mix(diclexNode*,unsigned char *mix, unsigned int len, unsigned char *str, diclexWordList *list);
diclexWordList *shoc_diclex_wordList_new();
void shoc_diclex_wordList_delete(diclexWordList *list);
myBool shoc_diclex_wordList_search(diclexWordList *list, unsigned char *word);
void shoc_diclex_wordList_append(diclexWordList *list, unsigned char *word);
void shoc_diclex_mix_appendchar(unsigned char *str, unsigned int len, unsigned char c);
#endif /* NODE_H_ */
