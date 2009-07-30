/*
 * ShoClinkedList.h
 *
 *  Created on: 24 mai 2009
 *      Author: sho
 */

#ifndef SHOCLINKEDLIST_H_
#define SHOCLINKEDLIST_H_

struct shoc_ll_node_ {
	void *pData;
	struct shoc_ll_node_ *pNext;
};
typedef struct shoc_ll_node_ shoc_ll_node;

struct shoc_ll_ {
	shoc_ll_node *pHead;
	shoc_ll_node *pTail;
	unsigned int size;
	void (*pFuncDelData)(void *);
};
typedef struct shoc_ll_ shoc_ll;

struct shoc_ll_iterator_ {
	shoc_ll *pList;
	shoc_ll_node *pNode;
};
typedef struct shoc_ll_iterator_ shoc_ll_iterator;

shoc_ll* shoc_ll_new(void);
void shoc_ll_delete(shoc_ll*);
void shoc_ll_setFuncDelete(shoc_ll*, void (*p_pFuncDelData)(void*));
void shoc_ll_append(shoc_ll*, shoc_ll_node*);
unsigned int shoc_ll_size(shoc_ll *list);
shoc_ll_node* shoc_ll_node_new(void);
void shoc_ll_node_delete(shoc_ll *list, shoc_ll_node*);

int shoc_ll_getIterator(shoc_ll*, shoc_ll_iterator*);
void shoc_ll_iterator_begin(shoc_ll_iterator*);
int shoc_ll_iterator_valid(shoc_ll_iterator*);
void shoc_ll_iterator_forth(shoc_ll_iterator*);
void *shoc_ll_iterator_item(shoc_ll_iterator*);


#endif /* SHOCLINKEDLIST_H_ */
