# KYC Chain Wallet

# Environment
set **NODE_ENV** to
* ```development``` to use **development** section of config file
* ```production``` to use **production** section of config file
* ```undefined``` will use **default** section of config file

## Prequesites
1. npm install -g gulp
2. npm install
3. cd wallet-web-app && npm install

**MacOSX**
* ```brew install wine```

**Linux**
* ```sudo apt-get install wine```

## Build Web Application
* ```gulp build:webapp```

## Build Desktop Application & Installer
* ```gulp build:desktop-app:osx64``` OSX .pkg 64bit
* ```gulp build:desktop-app:win32``` WIN .exe 32/64bit 
* ```gulp build:desktop-app:deb```   LINUX Ubuntu .deb 32/64bit 

## watch / development
* ```gulp watch:webapp```