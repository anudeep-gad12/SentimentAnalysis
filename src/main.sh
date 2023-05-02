#!/bin/bash
node index.js "$1"
node retrieve.js
python output.py "$1"