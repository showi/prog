/*
 * ShoCdiclexNode.cpp
 *
 *  Created on: 24 mai 2009
 *      Author: sho
 */

#include "ShoCdiclexNode.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "ShoCtypes.h"
#include "ShoCstr.h"
#include "ShoCdebug.h"

diclex* shoc_diclex_new(void)
{
	diclex *dic = malloc(sizeof(diclex));
	if (!dic)
	{
		fprintf(stderr, "Error: Cannot allocate memory for diclex structure\n");
		return 0;
	}
	dic->iNodeNum = 0;
	dic->iNumWord = 0;
	dic->pCharSet = 0;
	dic->pRoot = shoc_diclexNode_new();
	if (!dic->pRoot)
	{
		fprintf(stderr,
				"Error: Cannot allocate memory for root node in diclex structure\n");
		shoc_diclex_delete(dic);
		return 0;
	}
	return dic;
}

void shoc_diclex_delete(diclex* p_pDic)
{
	if (!p_pDic)
	{
		return;
	}
	if (p_pDic->pRoot)
	{
		shoc_diclexNode_delete(p_pDic->pRoot);
	}
	if (p_pDic->pCharSet)
	{
		free(p_pDic->pCharSet);
		p_pDic->pCharSet = 0;
	}
	free(p_pDic);
	p_pDic = 0;
}

void shoc_diclex_setCharSet(diclex* p_pDicLex, unsigned char* p_pzCharSet)
{
	if (!p_pDicLex)
	{
		fprintf(stderr,
				"Error: shoc_diclex_setCharSet, Null pointer on diclex structure\n");
		return;
	}
	if (!p_pzCharSet)
	{
		fprintf(stderr,
				"Error: shoc_diclex_setCharSet, Null pointer on char set string\n");
		return;
	}
	if (p_pDicLex->pCharSet)
	{
		free(p_pDicLex->pCharSet);
	}
	p_pDicLex->pCharSet = shoc_cpstring(p_pzCharSet);
}

void shoc_diclex_printstats(diclex* p_pDicLex)
{
	if (!p_pDicLex)
	{
		fprintf(stderr,
				"Error: Using shoc_diclex_printstats with null pointer on diclex structure\n");
		return;
	}
	printf("Statistiques:\n");
	printf("\tNombre de node(s)    : %0li\n", p_pDicLex->iNodeNum);
	printf("\tNombre de mot(s)     : %0li\n", p_pDicLex->iNumWord);
	if (p_pDicLex->pCharSet)
	{
		printf("\tCaractère autorisé(s): %s\n", p_pDicLex->pCharSet);
	}
}

diclexNode* shoc_diclexNode_new(void)
{
	diclexNode *node = malloc(sizeof(diclexNode));
	if (!node)
	{
		fprintf(stderr, "Cannot allocate memory for new diclexNode\n");
		return 0;
	}
	node->bIsTerminal = 0;
	node->iChar = -1;
	node->pChilds = 0;
	node->pParent = 0;
	return node;
}

void shoc_diclexNode_delete(diclexNode* p_pNode)
{
	if (p_pNode->pChilds)
	{
		shoc_ll_node* node = p_pNode->pChilds->pHead;
		if (node)
		{
			do
			{
				diclexNode *dicNode = (diclexNode*) node->pData;
				if (dicNode)
				{
					shoc_diclexNode_delete(dicNode);
				}
			} while ((node = node->pNext));
		}
		shoc_ll_delete(p_pNode->pChilds);
	}
	free(p_pNode);
	p_pNode = 0;
}

diclexNode* shoc_diclex_childExist(diclexNode* node, const unsigned char *p_iC,
		const myBool p_bTerminal)
{
	if (!node)
	{
		fprintf(stderr, "ChildExist() on null node\n");
		return 0;
	}
	if (!node->pChilds)
	{
		return 0;
	}
	shoc_ll_node* llNode = node->pChilds->pHead;
	if (!llNode)
	{
		return 0;
	}
	diclexNode *dicNode;
	do
	{
		dicNode = (diclexNode*) llNode->pData;
		if (dicNode)
		{
			if (p_bTerminal == -1)
			{
				if (*p_iC == dicNode->iChar)
				{
					return dicNode;
				}
			}
			else if (*p_iC == dicNode->iChar && dicNode->bIsTerminal
					== p_bTerminal)
			{
				return dicNode;
			}
		}
	} while ((llNode = llNode->pNext));
	return 0;
}

diclexNode* shoc_diclex_addChild(diclex* p_pDicLex, diclexNode* node,
		const unsigned char* c, myBool bTerminal)
{
	if (!node)
	{
		fprintf(stderr, "addChild() on null node\n");
		return 0;
	}
	diclexNode *newNode = shoc_diclexNode_new();
	if (!newNode)
	{
		fprintf(stderr,
				"Error: shoc_diclex_addChild, Cannot allocate memory fo new diclex_node\n");
		return 0;
	}
	newNode->iChar = *c;
	if (bTerminal)
	{
		newNode->bIsTerminal = 1;
	}
	shoc_ll_node *llNode = shoc_ll_node_new();
	if (!llNode)
	{
		fprintf(stderr,
				"Error: shoc_diclex_addChild, Cannot allocate memory fo new ll node\n");
		shoc_diclexNode_delete(newNode);
		return 0;
	}
	llNode->pData = (void*) newNode;
	if (!node->pChilds)
	{
		node->pChilds = shoc_ll_new();
		if (!node->pChilds)
		{
			fprintf(stderr,
					"Error: shoc_diclex_addChild, cannot create linked list for this node");
			shoc_diclexNode_delete(newNode);
			shoc_ll_node_delete(node->pChilds, llNode);
			return 0;
		}
	}
	shoc_ll_append(node->pChilds, llNode);
	p_pDicLex->iNodeNum++;
	return newNode;
}

void shoc_diclex_addWord(diclex* p_pDicLex, diclexNode* root,
		const unsigned char* p_pzWord, unsigned int pos, unsigned int len)
{
	if (!p_pDicLex)
	{
		fprintf(stderr,
				"Error: shoc_diclex_addWord, diclex parameter is null\n");
		return;
	}
	if (!root)
	{
		fprintf(stderr,
				"Error: shoc_diclex_addWord, root node parameter is null\n");
		return;
	}
	if (len < 1)
	{
		printf("We don't add null word : )\n");
		return;
	}
	if (pos >= len)
	{
		return;
	}
	//printf("Adding word %s, %u, %u, %c\n", p_pzWord, pos, len, p_pzWord[pos]);
	diclexNode* node;
	// Last letter
	if (pos == len - 1)
	{
		node = shoc_diclex_childExist(root, &p_pzWord[pos], 1);
		if (!node)
		{
			shoc_diclex_addChild(p_pDicLex, root, &p_pzWord[pos], 1);
		}
		return;
	}
	node = shoc_diclex_childExist(root, &p_pzWord[pos], 0);
	if (!node)
	{
		node = shoc_diclex_addChild(p_pDicLex, root, &p_pzWord[pos], 0);
	}
	if (!node)
	{
		fprintf(stderr, "Cannot add child!");
		return;
	}
	if (pos + 1 >= len)
	{
		return;
	}
	shoc_diclex_addWord(p_pDicLex, node, p_pzWord, pos + 1, len);
}

void shoc_diclex_loadFile(diclex* p_pDicLex, diclexNode* node,
		const char *p_pzFilename, unsigned int wordlen)
{
	if (!p_pDicLex)
	{
		fprintf(stderr,
				"Error: shoc_diclex_loadFile, null pointer on diclex structure\n");
		return;
	}
	if (!node)
	{
		fprintf(stderr,
				"Error: shoc_diclex_loadFile, null pointer on diclexNode structure\n");
		return;
	}
	printf("Chargement du dictionnaire '%s'\n", p_pzFilename);
	FILE *FH = fopen(p_pzFilename, "r");
	if (!FH)
	{
		printf("Ne peut ouvrir le dictionnaire %s\n", p_pzFilename);
		return;
	}
	unsigned char buffer[SHOCDICLEX_WORDMAXLEN];
	while (fgets(buffer, SHOCDICLEX_WORDMAXLEN, FH))
	{
		unsigned char *newStr = 0;
		if ((newStr = shoc_strnows(buffer)))
		{
			unsigned int len = strlen(newStr);
			if (wordlen != 0)
			{ // We need to check word size
				if (len <= wordlen)
				{
					shoc_diclex_addWord(p_pDicLex, node, newStr, 0, len);
					p_pDicLex->iNumWord++;
				}
				else // word too long
				{
					fprintf(stderr, "Error: Word too long '%s'\n", newStr);
				}
			}
			else
			{ // We don't care about word size
				shoc_diclex_addWord(p_pDicLex, node, newStr, 0, len);
				p_pDicLex->iNumWord++;
			}
			free(newStr);
			newStr = 0;
		}
	}
	fclose(FH);

}

void shoc_diclex_dumpNode(diclexNode* node, unsigned int lvl)
{
	if (!node)
		return;
	int i;
	for (i = 0; i < lvl; i++)
	{
		printf("#");
	}
	printf(" %c", node->iChar);
	if (node->bIsTerminal)
	{
		printf(" (T)");
	}
	printf("\n");
}

void shoc_diclex_dump(diclexNode* node, unsigned int lvl)
{
	shoc_diclex_dumpNode(node, lvl);
	if (!node->pChilds)
	{
		return;
	}
	shoc_ll_node *llNode = node->pChilds->pHead;
	if (!llNode)
	{
		return;
	}
	diclexNode *dicNode = 0;
	do
	{
		dicNode = (diclexNode*) llNode->pData;
		if (dicNode)
		{
			shoc_diclex_dump(dicNode, lvl + 1);
		}
	} while ((llNode = llNode->pNext));
}

myBool shoc_diclex_match(diclexNode* root, unsigned char *search,
		unsigned int pos, unsigned int len)
{
	diclexNode* node = 0;
	//printf("search char[%c]\n", search[pos]);
	if (pos == len - 1)
	{
		//printf("search terminal\n");
		node = shoc_diclex_childExist(root, &search[pos], 1);
		if (node)
		{
			//printf("Found terminal\n");
			return 1;
		}
		else
		{
			return 0;
		}
	}
	else
	{
		node = shoc_diclex_childExist(root, &search[pos], 0);
		if (node)
		{
			return shoc_diclex_match(node, search, pos + 1, len);
		}
		else
		{
			return 0;
		}
	}
	return 0;
}

diclexWordList *shoc_diclex_wordList_new()
{
	diclexWordList* wordList = malloc(sizeof(diclexWordList));
	if (!wordList)
	{
		fprintf(
				stderr,
				"Error: shoc_diclex_wordList_new, cannot allocate memory for wordList structure\n");
		return 0;
	}
	wordList->longest = 0;
	wordList->pWordList = shoc_ll_new();
	if (!wordList->pWordList)
	{
		fprintf(stderr,
				"Error: shoc_diclex_wordlist_new(), cannot allocate memory for word list\n");
		shoc_ll_delete(wordList->pWordList);
		return 0;
	}
	return wordList;
}

void shoc_diclex_wordList_delete(diclexWordList *list)
{
	if (!list)
	{
		return;
	}
	if (!list->pWordList)
	{
		return;
	}
	shoc_ll_node *node = list->pWordList->pHead;
	shoc_ll_node *next = 0;
	if (!node)
	{
		shoc_ll_delete(list->pWordList);
		return;
	}
	do
	{
		if (node->pData)
		{
			unsigned char *str = (unsigned char*) node->pData;
			free(str);
			str = 0;
		}
		next = node->pNext;
	} while ((node = next));
	shoc_ll_delete(list->pWordList);
	free(list);
	list = 0;
}

myBool shoc_diclex_wordList_search(diclexWordList *list, unsigned char *word)
{
	if (!list)
	{
		return 0;
	}
	if (!list->pWordList)
	{
		return 0;
	}
	//printf("list\n");
	shoc_ll_node *node = list->pWordList->pHead;
	shoc_ll_node *next = 0;
	if (!node)
	{
		return 0;
	}
	//printf("Do\n");
	do
	{
		if (node->pData)
		{
			unsigned char *str = (unsigned char*) node->pData;
			if ((strcmp(str, word) == 0))
			{
				//printf("Jugule\n");
				return 1;
			}
		}
		next = node->pNext;
	} while ((node = next));
	return 0;
}

void shoc_diclex_wordList_append(diclexWordList *list, unsigned char *word)
{
	//printf("shoc_diclex_wordlist_append\n");
	if (!list)
	{
		fprintf(stderr, "Error: shoc_diclex_wordlist_append, list is null\n");
		return;
	}
	//printf("Append word %s\n", word);
	if (shoc_diclex_wordList_search(list, word))
	{
		//printf("\nWord '%s' already in list\n", word);
		return;
	}
	//printf( "\tWord not present in list\n");
	shoc_ll_node *node = shoc_ll_node_new();
	//printf("\tCreate node\n");
	if (!node)
	{
		fprintf(stderr,
				"Error: shoc_diclex_wordlist_append, cannot allocate memory for node\n");
		return;
	}
	unsigned int len = strlen(word);
	//fprintf(stderr, "\tCreate word\n");
	unsigned char *newword = malloc(sizeof(unsigned char) * len + 1);
	if (!newword)
	{
		fprintf(stderr,
				"Error: shoc_diclex_wordlist_append, cannot allocate memory for newword\n");
		shoc_ll_node_delete(list->pWordList, node);
		return;
	}
	int i;
	//fprintf(stderr, "\tCopy word\n");
	for (i = 0; i < len; i++)
	{
		newword[i] = word[i];
	}
	newword[len] = '\0';
	//printf("Copied word %s == %s", newword, word);
	node->pData = (void*) newword;
	//fprintf(stderr, "\tbefore append \n");
	shoc_ll_append(list->pWordList, node);
	if (!list->longest)
	{
		list->longest = newword;
	}
	else if (len > strlen(list->longest))
	{
		list->longest = newword;
	}
}

void shoc_diclex_mix_appendchar(unsigned char *str, unsigned int len,
		unsigned char c)
{
	int i = 0;
	while (i < len)
	{
		if (str[i] == '\0')
		{
			//printf("Append char len[%i]\n", len);
			str[i] = c;
			return;
		}
		i++;
	}
}

myBool shoc_diclex_mix(diclexNode* root, unsigned char *mix, unsigned int len,
		unsigned char *str, diclexWordList *list)
{
	if (strlen(mix) < 1)
	{
		fprintf(stderr, "Error: shoc_diclex_mix, no mixed letter\n");
		return 0;
	}
	if (!list)
	{
		fprintf(stderr,
				"Error, shoc_diclex_mix, you must suplly a wordList linked list\n");
		return 0;
	}
	//fprintf(stderr, "mix: %s\n", mix);
	diclexNode* node = 0;
	int i, j;
	for (i = 0; i < len; i++)
	{
		if (mix[i] == 255)
		{
			continue;
		}
		//fprintf(stderr, "Test {%i} %c\n", i, mix[i]);
		if ((node = shoc_diclex_childExist(root, &mix[i], 1)))
		{
			unsigned char newstr[len + 1];
			for (j = 0; j < len; j++)
			{
				newstr[j] = str[j];
			}
			newstr[len] = '\0';
			shoc_diclex_mix_appendchar(newstr, len, mix[i]);
			//printf("\tTrouve mot %s\n", newstr);
			//printf("\tappend word\n");
			shoc_diclex_wordList_append(list, newstr);
			//printf("\tend append word\n");
			fflush(stderr);
		}
		if ((node = shoc_diclex_childExist(root, &mix[i], 0)))
		{
			unsigned char newstr[len + 1];
			for (j = 0; j < len; j++)
			{
				newstr[j] = str[j];
			}
			newstr[len] = '\0';
			shoc_diclex_mix_appendchar(newstr, len, mix[i]);
			unsigned char newmix[len];
			for (j = 0; j < len; j++)
			{
				newmix[j] = mix[j];
				newmix[len] = '\0';
			}
			newmix[i] = 255;
			shoc_diclex_mix(node, newmix, len, newstr, list);
		}
	}
	return 0;
}
