@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file to
@REM you under the Apache License, Version 2.0 (the "License");
@REM you may not use this file except in compliance with the License.
@REM You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing, software
@REM distributed under the License is distributed on an "AS IS" BASIS,
@REM WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@REM See the License for the specific language governing permissions and
@REM limitations under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM MAVEN_SKIP_RC - flag to disable loading of mavenrc files
@REM ----------------------------------------------------------------------------

@REM Begin all REM lines with '@' in case MAVEN_BATCH_ECHO is 'on'
@echo off
@REM set title of command window
title %0
@REM enable echoing by setting MAVEN_BATCH_ECHO to 'on'
@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Execute a user defined script before this one
if not "%MAVEN_SKIP_RC%" == "" goto skipRcPre
@REM check for pre script, once with legacy .bat ending and once with .cmd ending
if exist "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat" %*
if exist "%USERPROFILE%\mavenrc_pre.cmd" call "%USERPROFILE%\mavenrc_pre.cmd" %*
:skipRcPre

@setlocal

set ERROR_CODE=0

@REM To isolate internal variables from target environment, these variables, when
@REM set in the spec, will be prefixed with 'MVNW_'

@REM ====================
@REM Maven Wrapper Config
@REM ====================
set "MVNW_REPOURL=https://repo.maven.apache.org/maven2"

@REM ====================
@REM Find Java executable
@REM ====================
if not "%JAVA_HOME%" == "" goto javaHomeSet
echo.
echo Error: JAVA_HOME not found in your environment.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
echo.
goto error

:javaHomeSet
set JAVA_EXE=%JAVA_HOME%\bin\java.exe

if exist "%JAVA_EXE%" goto init

echo.
echo Error: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
goto error

:init
@REM Find the project base dir, i.e. the directory that contains the folder ".mvn".
@REM Fallback to current working directory if not found.

set "MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%"
if not "%MAVEN_BASEDIR%" == "" goto endDetectBaseDir

set EXEC_DIR=%CD%
set WDIR=%EXEC_DIR%
:findBaseDir
if exist "%WDIR%"\.mvn goto baseDirFound
cd ..
if "%WDIR%"=="%CD%" goto baseDirNotFound
set "WDIR=%CD%"
goto findBaseDir

:baseDirFound
set "MAVEN_PROJECTBASEDIR=%WDIR%"
cd "%EXEC_DIR%"
goto endDetectBaseDir

:baseDirNotFound
set "MAVEN_PROJECTBASEDIR=%EXEC_DIR%"
cd "%EXEC_DIR%"

:endDetectBaseDir

@REM =============================================================================
@REM Download and use Maven Wrapper JAR
@REM =============================================================================
set "MVNW_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set "MVNW_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

@REM If maven-wrapper.jar exists, use it directly
if exist "%MVNW_JAR%" goto runMaven

@REM Download Maven Wrapper JAR using Java
set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
echo Downloading %DOWNLOAD_URL%
"%JAVA_EXE%" -classpath "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper" MavenWrapperDownloader "%DOWNLOAD_URL%" "%MVNW_JAR%" 2>nul
if "%ERRORLEVEL%" == "0" goto runMaven

@REM Fallback: download using PowerShell
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -Command "&{"^
  "$webclient = new-object System.Net.WebClient;"^
  "if (-not (Test-Path '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper')) {"^
  "    New-Item -ItemType Directory -Force -Path '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper' | Out-Null"^
  "}"^
  "$webclient.DownloadFile('%DOWNLOAD_URL%', '%MVNW_JAR%')"^
  "}"
if "%ERRORLEVEL%" == "0" goto runMaven

echo Failed to download Maven Wrapper JAR
goto error

:runMaven
@REM Determine Maven distribution URL from properties file
set MAVEN_DIST_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
if exist "%MVNW_PROPERTIES%" (
  for /F "usebackq tokens=1,* delims==" %%a in ("%MVNW_PROPERTIES%") do (
    if "%%a"=="distributionUrl" set "MAVEN_DIST_URL=%%b"
  )
)

@REM Try running Maven from MAVEN_HOME first (avoids network download)
if not "%MAVEN_HOME%" == "" (
  "%MAVEN_HOME%\bin\mvn.cmd" %*
  goto end
)

@REM Try the cached wrapper distribution
set "MVNW_CACHED=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin"
for /D %%d in ("%MVNW_CACHED%\*") do (
  if exist "%%d\apache-maven-3.9.6\bin\mvn.cmd" (
    "%%d\apache-maven-3.9.6\bin\mvn.cmd" %*
    goto end
  )
)

@REM Run Maven using the wrapper JAR (requires network on first run)
"%JAVA_EXE%" -classpath "%MVNW_JAR%" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CONFIG% %* 2>nul
if not "%ERRORLEVEL%" == "0" (
  echo.
  echo Error running Maven Wrapper.
  echo Please ensure you have an internet connection for first-time setup.
  echo Alternatively, install Maven from https://maven.apache.org/download.cgi
  echo.
  goto error
)
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_BATCH_PAUSE%" == "on" goto end2
echo.
pause

:end2
if "%MAVEN_BATCH_ECHO%" == "on" echo off
exit /B %ERROR_CODE%
