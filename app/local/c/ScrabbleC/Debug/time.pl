#!/usr/bin/perl -w

use strict;
use IPC::open3;

exit 0;
my $sTime = time();
`ScrabbleC.exe`;
my $eTime = time();
my $et = $eTime - $sTime;
print "Duration: $et\n";

