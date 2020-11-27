import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { ViewProps } from "react-native";
import codePush from "react-native-code-push";
import codePushOptions from "../../config/code-push";
import Loading from "./Loading";

interface ICodePush extends ViewProps {
  children: ReactNode;
  mode?: string;
  loadingComponent?: (props: any) => ReactElement;
}

const Main = (props: ICodePush) => {
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState("");
  const [progress, setProgress] = useState(null);
  const init = async () => {
    if (!loading) setLoading(true);
    codePush.allowRestart();
    codePush.getUpdateMetadata(codePush.UpdateState.RUNNING);
    codePush.sync(
      codePushOptions,
      (syncStatus: any) => {
        switch (syncStatus) {
          case codePush.SyncStatus.SYNC_IN_PROGRESS:
            setSyncMessage("Loading...");
            setTimeout(() => {
              setLoading(false);
            }, 15000);
            break;
          case codePush.SyncStatus.CHECKING_FOR_UPDATE:
            setSyncMessage("Checking for update...");
            break;
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            setSyncMessage("Downloading package...");
            break;
          case codePush.SyncStatus.AWAITING_USER_ACTION:
            setSyncMessage("Awaiting user action...");
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            setSyncMessage("Installing update...");
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            setSyncMessage("App up to date.");
            setLoading(false);
            break;
          case codePush.SyncStatus.UPDATE_INSTALLED:
            setSyncMessage("Update installed, restarting the app.");
            codePush.restartApp();
            break;
          default:
            setSyncMessage("An unknown error occurred.");
            setLoading(false);
            break;
        }
      },
      (progress: any) => {
        setProgress(progress);
      }
    );
  };

  useEffect(() => {
    if (props.mode === "dev") {
      setLoading(false);
    } else {
      init();
    }
  }, []);

  if (!!loading && !!props.loadingComponent) {
    return props.loadingComponent({
      progress,
      syncMessage,
    });
  } else if (!!loading) {
    return <Loading progress={progress} syncMessage={syncMessage} />;
  }

  return props.children;
};
export default codePush(codePushOptions)(Main);
