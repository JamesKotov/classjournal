#!/usr/bin/env bash

systemctl stop classjournal.service
git pull
npm ci
systemctl start classjournal.service
