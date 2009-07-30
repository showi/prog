/*
 * ShoClinkedList.c
 *
 *  Created on: 24 mai 2009
 *      Author: sho
 */
#include "ShoClinkedList.h"
#include <stdio.h>
#include <stdlib.h>

shoc_ll* shoc_ll_new(void)
{
	shoc_ll* ll = malloc(sizeof(shoc_ll));
	if (!ll)
	{
		fprintf(stderr, "Cannot allocate memory for this linked list");
		return 0;
	}
	ll->pHead = 0;
	ll->pTail = 0;
	ll->size = 0;
	ll->pFuncDelData = 0;
	return ll;
}

void shoc_ll_delete(shoc_ll* p_pList)
{
	if (!p_pList)
	{
		return;
	}
	shoc_ll_node *node = p_pList->pHead;
	shoc_ll_node *tmpNode = 0;
	if (!node)
	{
		return;
	}
	do
	{
		tmpNode = node->pNext;
		shoc_ll_node_delete(p_pList, node);
	} while ((node = tmpNode));
	free(p_pList);
	p_pList = 0;
}

void shoc_ll_setFuncDelete(shoc_ll *list, void(*p_pFuncDelData)(void*))
{
	if (!list)
	{
		fprintf(stderr, "Error: shoc_ll_setFuncDelete, list is null\n");
		return;
	}
	list->pFuncDelData = p_pFuncDelData;
}

unsigned int shoc_ll_size(shoc_ll* p_pList)
{
	return p_pList->size;
}

void shoc_ll_append(shoc_ll* p_pList, shoc_ll_node* p_pNode)
{
	if (!p_pList)
	{
		fprintf(stderr, "Error: shoc_ll_append, null node\n");
		return;
	}
	if (!p_pNode)
	{
		fprintf(stderr, "Error: shoc_ll_append, Try to append null node\n");
		return;
	}
	if (p_pList->pTail == 0)
	{
		p_pList->pHead = p_pNode;
		p_pList->pTail = p_pNode;
		p_pList->size++;
		return;
	}
	shoc_ll_node* node = p_pList->pTail;
	if (!node)
	{
		printf("Empty tail");
		return;
	}
	node->pNext = p_pNode;
	p_pList->pTail = p_pNode;
	p_pList->size++;
}

shoc_ll_node* shoc_ll_node_new(void)
{
	shoc_ll_node* node = malloc(sizeof(shoc_ll_node));
	if (!node)
	{
		fprintf(stderr, "Cannot allocate memory for this linked list node");
		return 0;
	}
	node->pData = 0;
	node->pNext = 0;
	return node;
}

void shoc_ll_node_delete(shoc_ll *list, shoc_ll_node* p_pNode)
{
	/*!TODO lié la list lors de la suppression ou créer des fonctions séparées pour la purge et le retrait d'un élément
	 * en laissant la liste dans un état correct */
	if (p_pNode)
	{
		if (p_pNode->pData && list->pFuncDelData)
		{
			list->pFuncDelData(p_pNode->pData);
		}
		free(p_pNode);
		p_pNode = 0;
		list->size--;
	}
}

int shoc_ll_getIterator(shoc_ll *p_pList, shoc_ll_iterator *p_pIterator) {
	if (!p_pList) {
		fprintf(stderr, "Error: shoc_ll_getIterator, cannot get iterator on null list!\n");
		return 0;
	}
	if (!p_pIterator) {
		fprintf(stderr, "Error: shoc_ll_getIterator, need valid iterator structure!\n");
		return 0;
	}
	p_pIterator->pList = p_pList;
	p_pIterator->pNode = p_pList->pHead;
	return 1;
}

void shoc_ll_iterator_begin(shoc_ll_iterator *p_pItr) {
	if (!p_pItr) {
		fprintf(stderr, "Error: shoc_ll_getIterator, need valid iterator structure!\n");
		return;
	}
	p_pItr->pNode = p_pItr->pList->pHead;
}

int shoc_ll_iterator_valid(shoc_ll_iterator *p_pItr) {
	if (p_pItr->pNode) {
		return 1;
	}
	return 0;
}

void shoc_ll_iterator_forth(shoc_ll_iterator *p_pItr) {
	if (p_pItr->pNode)
		p_pItr->pNode = p_pItr->pNode->pNext;
}

void *shoc_ll_iterator_item(shoc_ll_iterator *p_pItr) {
	if (!p_pItr->pNode)
		return 0;
	return p_pItr->pNode->pData;
}
