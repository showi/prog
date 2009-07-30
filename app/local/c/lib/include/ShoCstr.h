/*
 * ShoCstr.h
 *
 *  Created on: 25 mai 2009
 *      Author: sho
 */

#ifndef SHOCSTR_H_
#define SHOCSTR_H_
#include "ShoCtypes.h"


unsigned char *shoc_strnows(const unsigned char *p_pzStr);// unsigned char *p_pzNewStr);
myBool shoc_strfilter(const unsigned char *p_pzCharSet, const unsigned char *p_pzString);
int shoc_strisp(const unsigned char c);
char *shoc_cpstring(const char *p_pzSrc);
void shoc_convertchar(unsigned char *p_pzStr);
#endif /* SHOCSTR_H_ */
