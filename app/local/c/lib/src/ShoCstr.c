/*
 * ShoCstr.c
 *
 *  Created on: 25 mai 2009
 *      Author: sho
 */

#include "ShoCstr.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
int shoc_strisp(const unsigned char c) {
	if (c < 0x21)
		return 0;
	if ((c > 0x7E) && (c < 0xA1))
		return 0;
	return 1;
}
unsigned char* shoc_strnows(const unsigned char *p_pzStr)
{
	if (!p_pzStr)
	{
		fprintf(stderr, "Error: shoc_strclean, source string is null");
		return 0;
	}
	unsigned int len = strlen(p_pzStr);
	unsigned char tmpStr[128]; // NO SIZE CHECK!!!!!!!!!!!!!!
	if (!tmpStr)
	{
		fprintf(stderr,
				"Error: shoc_strclean, cannot allocate memory for temporary sring");
		return 0;
	}
	int i;
	int iNew = 0;
	for (i = 0; i < len; i++)
	{
		//printf ("code: %c %i\n", p_pzStr[i], (int)p_pzStr[i]);
		int bOk = 1;
		if (p_pzStr[i] < 0x21)
			bOk = 0;
		if ((p_pzStr[i] > 0x7E) && (p_pzStr[i] < 0xA1))
		{
			bOk = 1;
		}
		if (bOk)
		{
			tmpStr[iNew] = p_pzStr[i];
			iNew++;
		}
	}
	tmpStr[iNew] = '\0';
	unsigned int newLen = strlen(tmpStr);
	unsigned char *p_pzNewStr = 0;
	p_pzNewStr = malloc(sizeof(unsigned char) * (newLen + 1));
	if (!p_pzNewStr)
	{
		fprintf(stderr,
				"Error: shoc_strclean, Cannot allocate memory for destination string\n");
		return 0;
	}
	else
	{
		strncpy(p_pzNewStr, tmpStr, newLen);
		p_pzNewStr[newLen] = '\0';
	}
	return p_pzNewStr;
}

void shoc_convertchar(unsigned char *p_pzStr) {
	if (!p_pzStr)
		return;
	int i;
	unsigned int len = strlen(p_pzStr);
	for (i = 0; i < len; i++) {
		switch(p_pzStr[i]) {
		case 130: // é
			p_pzStr[i] = 233;
			break;
		case 138: // è
			p_pzStr[i] = 232;
			break;
		case 136: // ê
			p_pzStr[i] = 234;
			break;
		case 137: // ë
			p_pzStr[i] = 235;
			break;
		case 131: // â
			p_pzStr[i] = 226;
			break;
		case 132: // ä
			p_pzStr[i] = 228;
			break;
		case 133: // à
			p_pzStr[i] = 224;
			break;
		case 139: // ï
			p_pzStr[i] = 239;
			break;
		case 140: // î
			p_pzStr[i] = 238;
			break;
		case 135: // ç
			p_pzStr[i] = 231;
			break;
		case 150: // û
			p_pzStr[i] = 251;
			break;
		case 129: // ü
			p_pzStr[i] = 252;
			break;
		case 147: // ô
			p_pzStr[i] = 244;
			break;
		case 148: // ö
			p_pzStr[i] = 246;
			break;
		}
	}
}
char* shoc_cpstring(const char *p_pzSrc) {
	if (!p_pzSrc) {
		fprintf(stderr, "Error: shoc_cpstring, source is null\n");
		return 0;
	}
	unsigned int len = strlen(p_pzSrc);
	char *p_pzTarget = malloc(sizeof(char)*(len+1));
	if (!*p_pzTarget) {
		fprintf(stderr, "Error: shoc_cpstring, cannot allocate memory for target string\n");
		return 0;
	}
	int i;
	for (i = 0; i < len; i++) {
		p_pzTarget[i] = p_pzSrc[i];
	}
	p_pzTarget[len] = '\0';
	return p_pzTarget;
}

myBool shoc_strfilter(const unsigned char *p_pzCharSet, const unsigned char *p_pzString) {
	if (!p_pzCharSet) {
		return 1;
	}
	if (!p_pzString) {
		return 0;
	}
	unsigned int len = strlen(p_pzString);
	unsigned int i;
	unsigned int charlen = strlen(p_pzCharSet);
	unsigned int j;
	myBool bOk;
	for(i = 0; i < len; i++) {
		bOk = 0;
		for (j = 0; j < charlen; j++) {
			if (p_pzCharSet[j] == p_pzString[i]) {
				bOk = 1;
				continue;
			}
		}
		if (!bOk) {
			return 0;
		}
	}
	return 1;
}
