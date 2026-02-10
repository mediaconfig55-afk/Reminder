const { withAndroidManifest, withDangerousMod, withProjectBuildGradle, withAppBuildGradle, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WIDGET_NAME = 'ReminderWidget';

const withAndroidWidget = (config) => {
    config = withWidgetManifest(config);
    config = withWidgetSourceFiles(config);
    return config;
};

const withWidgetManifest = (config) => {
    return withAndroidManifest(config, async (config) => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
        const widgetReceiver = {
            $: {
                'android:name': `.${WIDGET_NAME}`,
                'android:exported': 'false',
                'android:label': 'Hatırlatıcı',
            },
            'intent-filter': [
                {
                    action: [
                        { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
                    ],
                },
            ],
            'meta-data': [
                {
                    $: {
                        'android:name': 'android.appwidget.provider',
                        'android:resource': '@xml/reminder_widget_info',
                    },
                },
            ],
        };

        mainApplication.receiver = mainApplication.receiver || [];
        mainApplication.receiver.push(widgetReceiver);

        return config;
    });
};

const withWidgetSourceFiles = (config) => {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;
            const platformRoot = config.modRequest.platformProjectRoot;
            const packageName = config.android?.package || 'com.anonymous.nat';
            const packagePath = packageName.replace(/\./g, '/');

            // 1. Copy Native Widget Code (Java/Kotlin)
            const widgetSourceDir = path.join(projectRoot, 'plugins', 'widget', 'android', 'src');
            const widgetDestDir = path.join(platformRoot, 'app', 'src', 'main', 'java', packagePath);

            if (fs.existsSync(widgetSourceDir)) {
                fs.mkdirSync(widgetDestDir, { recursive: true });
                let widgetContent = fs.readFileSync(path.join(widgetSourceDir, `${WIDGET_NAME}.java`), 'utf8');
                widgetContent = widgetContent.replace('package com.anonymous.nat;', `package ${packageName};`);
                fs.writeFileSync(path.join(widgetDestDir, `${WIDGET_NAME}.java`), widgetContent);
            }

            // 2. Copy Resources (XML, Layouts)
            const resSourceDir = path.join(projectRoot, 'plugins', 'widget', 'android', 'res');
            const resDestDir = path.join(platformRoot, 'app', 'src', 'main', 'res');

            if (fs.existsSync(resSourceDir)) {
                copyFolderRecursiveSync(resSourceDir, resDestDir);
            }

            return config;
        },
    ]);
};

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach((file) => {
        const curSource = path.join(source, file);
        const curDest = path.join(target, file);

        if (fs.lstatSync(curSource).isDirectory()) {
            copyFolderRecursiveSync(curSource, curDest);
        } else {
            fs.copyFileSync(curSource, curDest);
        }
    });
}

module.exports = withAndroidWidget;
