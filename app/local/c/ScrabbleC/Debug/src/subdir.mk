################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
../src/ScrabbleC.c \
../src/ShoCdebug.c \
../src/ShoCdiclexNode.c \
../src/ShoCstringToken.c 

OBJS += \
./src/ScrabbleC.o \
./src/ShoCdebug.o \
./src/ShoCdiclexNode.o \
./src/ShoCstringToken.o 

C_DEPS += \
./src/ScrabbleC.d \
./src/ShoCdebug.d \
./src/ShoCdiclexNode.d \
./src/ShoCstringToken.d 


# Each subdirectory must supply rules for building sources it contributes
src/%.o: ../src/%.c
	@echo 'Building file: $<'
	@echo 'Invoking: GCC C Compiler'
	gcc -I"F:\_WORKSPACE_\ShoClib\include" -O0 -g3 -Wall -c -fmessage-length=0 -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@:%.o=%.d)" -o"$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


