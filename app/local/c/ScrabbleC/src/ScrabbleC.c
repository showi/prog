/*
 ============================================================================
 Name        : ScrabbleC.c
 Author      : Sho
 Version     : 0.1
 Copyright   : Qui n'en veut
 Description : Hello World in C, Ansi-style
 ============================================================================
 */

//#define ISWIN 1

#ifdef ISWIN
#include <windows.h>
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "ShoCtypes.h"
#include "ShoClinkedList.h"
#include "ShoCdiclexNode.h"
#include "ShoCstr.h"
#include "ShoCstringToken.h"

struct scglobal_ {
	myBool bQuit;
	myBool bDebug;
	unsigned int iMode;
	unsigned char *pzPrompt;
	diclex *pDicLex;
};
typedef struct scglobal_ scglobal;
scglobal gVar;

void help(void);
void scglobal_init(scglobal *in, diclex* p_pDicLex);
void showAsciiCode(const unsigned char *p_pzStr);
myBool isFile(const char *p_pzFilename);

void scglobal_init(scglobal *in, diclex *p_pDicLex) {
	in->bQuit    = 0;
	in->bDebug   = 0;
	in->iMode    = 0;
	in->pzPrompt = 0;
	in->pDicLex = p_pDicLex;
}

void scglobal_delete(scglobal *in) {
	if (!in) {
		return;
	}
	if (in->pzPrompt) {
		free(in->pzPrompt);
		in->pzPrompt = 0;
	}
}

void scglobal_setPrompt(scglobal *in, const unsigned char* p_pzPrompt) {
	if (!in) {
		return;
	}
	unsigned int len = strlen(p_pzPrompt);
	if (!p_pzPrompt || !len) {
		if (in->pzPrompt) {
			free(in->pzPrompt);
			in->pzPrompt = 0;
		}
		return;
	}
	if (in->pzPrompt) {
		free(in->pzPrompt);
		in->pzPrompt = 0;
	}
	in->pzPrompt = malloc(sizeof(unsigned char)*(len+1));
	strncpy(in->pzPrompt, p_pzPrompt, len + 1);
	in->pzPrompt[len] = '\0';
	printf("New prompt: %s\n", in->pzPrompt);
}

void action_search(shoc_ll_node* node) {
	if (!node) {
		printf("La commande search requière un mot à chercher, s[earch] <word>\n");
		return;
	}
	string_token* token = (string_token*)node->pData;
	if (!token) {
		fprintf(stderr, "Error: action_search, node without string_token data\n");
		return;
	}
	if (gVar.iMode == 0) {
		printf("Le mot '%s' est ", token->pzString);
	}
	if (shoc_diclex_match(gVar.pDicLex->pRoot, token->pzString, 0, token->len)) {
		if (gVar.iMode == 1) {
			printf("1 search %s\n", token->pzString);
		}  else {
			printf("présent dans le dictionnaire");
		}
	} else {
		if (gVar.iMode == 1) {
			printf("0 search %s\n", token->pzString);
		}  else {
			printf("absent du dictionnaire");
		}
	}
	printf("\n");
}

void action_load(shoc_ll_node* node) {
	if (!node) {
		printf("La commande load requière un nom de fichier, l[oad] <fichier>\n");
		return;
	}
	string_token* token = (string_token*)node->pData;
	if (!token) {
		fprintf(stderr, "Error: action_load, node without string_token data\n");
		return;
	}
	if (!isFile(token->pzString)) {
		fprintf(stderr, "Ne peut pas ouvrir le fichier '%s'", token->pzString);
		return;
	}
	shoc_diclex_loadFile(gVar.pDicLex, gVar.pDicLex->pRoot, token->pzString, 0);
}

void action_mode(shoc_ll_node* node) {
	if (!node) {
		printf("La commande mode requière un nom de mode, mode <human|bot>\n");
		return;
	}
	string_token* token = (string_token*)node->pData;
	if (!token) {
		fprintf(stderr, "Error: action_mode, node without string_token data\n");
		return;
	}
	if (strcmp(token->pzString, "human") == 0) {
		gVar.iMode = 0;
		scglobal_setPrompt(&gVar, "# ");
	} else if (strcmp(token->pzString, "bot") == 0) {
		gVar.iMode = 1;
		scglobal_setPrompt(&gVar, "");
		printf("1 mode bot\n");
	} else {
		fprintf(stderr, "Mode invalide, les modes possible sont human|bot\n");
	}

}

void action_free(shoc_ll_node* node) {
	if (!gVar.pDicLex->pRoot) {
		return;
	}
	if (!gVar.pDicLex->pRoot->pChilds) {
		return;
	}
	shoc_ll_node *child = gVar.pDicLex->pRoot->pChilds->pHead;
	if (!child) {
		fprintf(stderr, "Arbre lexicographique déjà vide\n");
		return;
	}
	do {
		shoc_diclexNode_delete((diclexNode*)child->pData);
	} while ((child = child->pNext));
	shoc_ll_delete(gVar.pDicLex->pRoot->pChilds);
	gVar.pDicLex->pRoot->pChilds = shoc_ll_new();
	if(!gVar.pDicLex->pRoot->pChilds){
		fprintf(stderr, "Error: action_free, cannot allocate memory for linked list\n");
		return;
	}
}

void action_mix(shoc_ll_node* node) {
	if (!node) {
		printf("La commande mix requière une liste de lettre à chercher, m[ix] <letters>\n");
		return;
	}
	string_token* token = (string_token*)node->pData;
	if (!token) {
		fprintf(stderr, "Error: action_mix, node without string_token data\n");
		return;
	}
	diclexWordList *list = shoc_diclex_wordList_new();
	if (!list) {
		return;
	}
	unsigned int len = strlen(token->pzString);
	//printf("String '%s' [%i]\n", token->pzString, len);
	unsigned char str[len+1];
	memset(str, '\0', len);
	shoc_diclex_mix(gVar.pDicLex->pRoot, token->pzString, len , str, list);
	if (!list->pWordList || !list->pWordList->size) {
		if (gVar.iMode == 1) { // bot
			printf("0 mix %s\n", token->pzString);
		}
		shoc_diclex_wordList_delete(list);
		return;
	}
	unsigned int i = 1;
	shoc_ll_node *lnode = list->pWordList->pHead;
	if (gVar.iMode == 1) { // bot
		printf("1 mix %s : ", token->pzString);
	}
	if (lnode) {
		do {

			unsigned char* str = (unsigned char*)lnode->pData;
			if (gVar.iMode == 1) { // bot
				printf("%s ", str);
			} else {
				printf("\t[%3i] %s\n", i, str);
			}
			i++;
		} while((lnode = lnode->pNext));
	}
	if (gVar.iMode == 1) { // bot
		printf("\n");
	} else {
		if (list->longest) {
			printf("Un des plus long: %s\n", list->longest);
		}
	}
	shoc_diclex_wordList_delete(list);
}

void read_line()
{
	unsigned char buffer[SCRABBLE_MAXBUFFER];
	memset(buffer, '\0', SCRABBLE_MAXBUFFER);
	unsigned int index = 0;
	int c;
	shoc_ll *strll = 0;
	while ((index < SCRABBLE_MAXBUFFER) && (c = getc(stdin)) != '\n')
	{
		buffer[index] = (unsigned char) c;
		index++;
	}
	unsigned char *p = strchr(buffer, '\n');
	shoc_convertchar(buffer);
	if (p)
	{
		*p = '\0';
	}
	else
	{
		buffer[index] = '\0';
	}
	if (strlen(buffer) < 1)
	{
		return;
	}
	index = 0;
	strll = getprintable(buffer, SCRABBLE_MAXBUFFER);
	if (!strll)
	{
		return;
	}
	shoc_ll_node *node = strll->pHead;
	if (!node)
	{
		string_token_list_delete(strll);
		return;
	}
	string_token *token = (string_token*) node->pData;
	if (!token)
	{
		string_token_list_delete(strll);
		return;
	}
	if (token->pos == 0)
	{
		if ((strcmp(token->pzString, "q")) == 0 || (strcmp(token->pzString,
				"quit") == 0))
		{
			gVar.bQuit = 1;
		}
		else if ((strcmp(token->pzString, "h") == 0) || (strcmp(
				token->pzString, "help") == 0))
		{
			help();
		}
		else if ((strcmp(token->pzString, "s") == 0) || (strcmp(
				token->pzString, "search") == 0))
		{
			action_search(node->pNext);
		}
		else if ((strcmp(token->pzString, "m") == 0) || (strcmp(
				token->pzString, "mix") == 0))
		{
			action_mix(node->pNext);
		}
		else if ((strcmp(token->pzString, "l") == 0) || (strcmp(
				token->pzString, "load") == 0))
		{
			action_load(node->pNext);
		}
		else if ((strcmp(token->pzString, "f") == 0) || (strcmp(
				token->pzString, "free") == 0))
		{
			action_free(node->pNext);
		}
		else if ((strcmp(token->pzString, "mode") == 0))
		{
			action_mode(node->pNext);
		}
		else
		{
			printf("Commande inconnue '%s'\n", token->pzString);
		}
	}
	string_token_list_delete(strll);
}

myBool isFile(const char *p_pzFilename) {
	FILE *FH = fopen(p_pzFilename, "r");
	if (FH) {
		fclose(FH);
		return 1;
	}
	return 0;
}

void showAsciiCode(const unsigned char *p_pzStr) {
	if(!p_pzStr)
		return;
	unsigned int len = strlen(p_pzStr);
	int i;
	for (i = 0; i < len; i++) {
		printf("%c[%i]", p_pzStr[i], (unsigned int)p_pzStr[i]);
	}
	printf("\n");
}

void help() {
	printf ("(ScrabbleC) Commandes:\n");
	printf ("\tq[uit]             : quitter\n");
	printf ("\ts[earch] <word>    : cherche un mot\n");
	printf ("\tm[ix]    <letters> : cherche les mots constitués des lettres données\n");
	printf ("\tl[oad]   <file>    : charge un fichier (un mot par ligne)\n");
	printf ("\tf[ree]             : vide l'arbre lexicographique\n");
	printf ("\th[elp]             : affiche l'aide\n");
	printf("\nGPL...joachim<dot>basmaison<at>gmail<dot>com\n");
}

int main(int argc, char **argv) {
	char *pzCharSet = "abcdefghijklmnopqrstuvwxyzéèêëàäâçïîöô-";
	char *pzFilename = 0;
	unsigned int wordlen = 0;
	if (argc == 3) {
		if (atoi(argv[2]) > 0) {
			wordlen = atoi(argv[2]);
		}
		if (isFile(argv[1])) {
			 pzFilename = shoc_cpstring(argv[1]);
		}
	}
	if (!pzFilename) {
		pzFilename = shoc_cpstring("data/Words_fr_FR.txt");
	}
#ifdef ISWIN
	UINT default_codepage = GetConsoleOutputCP();
	SetConsoleOutputCP(28591);
#endif
	diclex* pDicLex = shoc_diclex_new();
	if (!pDicLex) {
		fprintf(stderr, "Error: main, Cannot create diclex structure!\n");
		exit(1);
	}
	scglobal_init(&gVar, pDicLex);
	shoc_diclex_setCharSet(pDicLex, pzCharSet);
	unsigned char *word = "abcdefghijklmnopqrstuvwxyzéèêëàäâçïîöô-";
	if (shoc_strfilter(pzCharSet, word)) {
		printf("Mot '%s' ok!", word);
	} else {
		printf("Mot '%s' pas ok!", word);
	}
	printf("\n");
	//shoc_diclex_loadFile(pDicLex, pDicLex->pRoot, pzFilename, wordlen);
	shoc_diclex_printstats(pDicLex);
	shoc_diclex_delete(pDicLex);
//	diclexNode* pRoot = shoc_diclexNode_new();
//	scglobal_init(&gVar, pRoot);
//	shoc_diclex_loadFile(pRoot, pzFilename, wordlen);
//	if (pzFilename)
//		free(pzFilename);
//	help();
//	scglobal_setPrompt(&gVar, "# ");
//	//showAsciiCode("éèêëçïîöôâàäüû");
//	gVar.bDebug = 1;
//	fflush(stdin);
//	fflush(stdout);
//	fflush(stderr);
//	do{
//		if (gVar.pzPrompt)
//			printf("%s", gVar.pzPrompt);
//		read_line();
//		fflush(stdin);
//		fflush(stdout);
//		fflush(stderr);
//	} while(!gVar.bQuit);
//	printf("Goodbye\n");
//	shoc_diclexNode_delete(pRoot);
//	scglobal_delete(&gVar);
//	fflush(stdin);
//	fflush(stdout);
//	fflush(stderr);
#ifdef ISWIN
	SetConsoleOutputCP(default_codepage);
#endif
	return EXIT_SUCCESS;
}
