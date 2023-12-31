import React  from 'react';
import {useSubscription, gql } from '@apollo/client';
import {ExpandedCallbackSideDetails} from './ExpandedCallbackSideDetails';
import  {useParams} from "react-router-dom";
import {CallbacksTabsTaskingPanel} from '../Callbacks/CallbacksTabsTasking';
import { snackActions } from '../../utilities/Snackbar';
import Split from 'react-split';


const SUB_Callbacks = gql`
subscription CallbacksSubscription ($callback_display_id: Int!){
  callback_stream(batch_size: 1, cursor: {initial_value: {last_checkin: "1970-01-01"}}, where: {display_id: {_eq: $callback_display_id}}) {
    architecture
    description
    display_id
    domain
    external_ip
    host
    id
    integrity_level
    ip
    last_checkin
    current_time
    init_callback
    locked
    locked_operator {
      username
    }
    extra_info
    sleep_info
    pid
    os
    user
    agent_callback_id
    operation_id
    process_name
    payload {
      os
      payloadtype {
        name
        id
      }
      description
      id
    }
    callbacktokens(where: {deleted: {_eq: false}}) {
      token {
        token_id
        id
        user
        description
      }
      callback {
        id
      }
      id
    }
  }
}
 `;


export function ExpandedCallback(props){
    
    const {callbackDisplayId} = useParams();
    const [callback, setCallbacks] = React.useState({"payload": {"payloadtype": {"name": ""}}, "callbacktokens": []});
    const [tabInfo, setTabInfo] = React.useState({displayID: parseInt(callbackDisplayId)});
    useSubscription(SUB_Callbacks, {
        variables: {callback_display_id: tabInfo.displayID}, fetchPolicy: "network-only",
        shouldResubscribe: true,
        onSubscriptionData: ({subscriptionData}) => {
          if(subscriptionData.data.callback_stream.length === 0){
            snackActions.error("Unknown Callback");
            return;
          }
          setCallbacks(subscriptionData.data.callback_stream[0]);
          setTabInfo({tabID: "interact", tabType: "interact",
          displayID: subscriptionData.data.callback_stream[0]["display_id"],
          callbackID: subscriptionData.data.callback_stream[0]["id"],
          payloadtype: subscriptionData.data.callback_stream[0]["payload"]["payloadtype"]["name"],
          payloadDescription: subscriptionData.data.callback_stream[0]["payload"]["description"],
          callbackDescription: subscriptionData.data.callback_stream[0]["description"],
          operation_id: subscriptionData.data.callback_stream[0]["operation_id"],
          os: subscriptionData.data.callback_stream[0]["payload"]["os"]});
        }
    });

    return (
        <div style={{width: "100%", height: "100%", maxHeight: "100%",}}>
          {tabInfo.payloadtype !== undefined ? (
              <Split direction="horizontal" style={{width: "100%", height: "100%", display: "flex", flexDirection: "row" }} sizes={[30, 70]} >
                  <div className="bg-gray-base" style={{display: "inline-flex"}}>
                      <ExpandedCallbackSideDetails me={props.me} callback={callback} />
                  </div>
                  <div className="bg-gray-light" style={{display: "inline-flex"}}>
                      <CallbacksTabsTaskingPanel me={props.me} tabInfo={tabInfo} callbacktokens={callback.callbacktokens}/>
                  </div>
            </Split>
          ) : (
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", left: "50%", top: "50%"}}>Fetching Callback</div>
          )}
            
        </div>
    );
}
