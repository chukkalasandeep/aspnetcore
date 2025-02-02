import { DotNet } from '@microsoft/dotnet-js-interop';
import { Blazor } from './GlobalExports';
import { shouldAutoStart } from './BootCommon';
import { internalFunctions as navigationManagerFunctions } from './Services/NavigationManager';
import { startIpcReceiver } from './Platform/WebView/WebViewIpcReceiver';
import { sendAttachPage, sendBeginInvokeDotNetFromJS, sendEndInvokeJSFromDotNet, sendByteArray, sendLocationChanged } from './Platform/WebView/WebViewIpcSender';

let started = false;

async function boot(): Promise<void> {
  if (started) {
    throw new Error('Blazor has already started.');
  }
  started = true;

  startIpcReceiver();

  DotNet.attachDispatcher({
    beginInvokeDotNetFromJS: sendBeginInvokeDotNetFromJS,
    endInvokeJSFromDotNet: sendEndInvokeJSFromDotNet,
    sendByteArray: sendByteArray,
  });

  navigationManagerFunctions.enableNavigationInterception();
  navigationManagerFunctions.listenForNavigationEvents(sendLocationChanged);

  sendAttachPage(navigationManagerFunctions.getBaseURI(), navigationManagerFunctions.getLocationHref());
}

Blazor.start = boot;

if (shouldAutoStart()) {
  boot();
}
