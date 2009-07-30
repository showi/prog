/*
 * ShoCdebug.c
 *
 *  Created on: 27 mai 2009
 *      Author: sho
 */
#include <stdio.h>
#include <stdarg.h>
void debug(const char* p_pzFormat) {
	fprintf(stderr, p_pzFormat);
	fflush(stderr);
}
