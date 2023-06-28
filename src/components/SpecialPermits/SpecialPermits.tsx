import * as React from "react";
import { useHistory } from "react-router-dom";
import { IContextProvider } from "../../uxp";
import CrudComponent from "../common/CrudComponent/CrudComponent";

interface ISpecialPermitsProps {
  uxpContext: IContextProvider;
}

const SpecialPermits: React.FunctionComponent<ISpecialPermitsProps> = (
  props
) => {
  const history = useHistory();
  return (
    <div className="page-content">
      <CrudComponent
        entityName="Special Permits"
        uxpContext={props.uxpContext}
        list={{
          default: {
            model: "SpecialPermits",
            action: "specialPermitsAll",
            itemId: "id",
            responseCodes: {
              successCode: 101601,
              errorCodes: {
                101602: [
                  {
                    error: "ERR_FETCHING_SPECIAL_PERMITS",
                    message:
                      "Unable to get special permits. Something went wrong",
                  },
                ],
              },
            },
            columns: [
              {
                name: "Name",
                valueField: "name",
                columnWidth: "70%",
              },
            ],
            deleteItem: {
              model: "SpecialPermits",
              action: "specialPermitsDelete",
              responseCodes: {
                successCode: 101601,
                successMessage: "Special Permit deleted",
                errorCodes: {
                  101602: [
                    {
                      error: "ERR_DELETING_SPECIAL_PERMITS",
                      message:
                        "Unable to delete special permit. Something went wrong",
                    },
                    {
                      error: "ERR_SPECIAL_PERMITS_NOT_FOUND",
                      message:
                        "Unable to delete special permit. No special found",
                    },
                  ],
                },
              },
            },
            toolbar: {
              search: {
                show: true,
                searchableFields: ["name"],
              },
            },
          },
        }}
        add={{
          default: {
            model: "SpecialPermits",
            action: "specialPermitsCreate",
            responseCodes: {
              successCode: 101601,
              successMessage: "Special permit created",
              errorCodes: {
                101602: [
                  {
                    error: "ERR_NAME_IS_EMPTY",
                    message:
                      "Unable to create special permit. Name is required",
                  },
                  {
                    error: "ERR_NAME_ALREADY_EXISTS",
                    message:
                      "Unable to create special permit. Name is already exists",
                  },
                  {
                    error: "ERR_CREATING_SPECIAL_PERMITS",
                    message:
                      "Unable to create special permit. Something went wrong",
                  },
                ],
              },
            },
            formStructure: [
              {
                name: "name",
                label: "Name",
                type: "string",
                validate: {
                  required: true,
                },
              },
            ],
            afterSave: () => {
              history.push("/speacial-permits");
            },
            onCancel: () => {
              history.push("/speacial-permits");
            },
          },
        }}
        edit={{
          default: {
            getDetails: {
              model: "SpecialPermits",
              action: "specialPermitsDetails",
              responseCodes: {
                successCode: 101601,
                errorCodes: {
                  101602: [
                    {
                      error: "ERR_VEHICLE_SPECIAL_PERMIT_NOT_FOUND",
                      message:
                        "Unable to get special permit details. No special permit found.",
                    },
                    {
                      error: "ERR_FETCHING_DETAILS",
                      message:
                        "Unable to get special permit details. Something went wrong.",
                    },
                  ],
                },
              },
            },
            model: "SpecialPermits",
            action: "specialPermitsUpdate",
            responseCodes: {
              successCode: 101601,
              successMessage: "Special permit updated",
              errorCodes: {
                101602: [
                  {
                    error: "ERR_SPECIAL_PERMIT_NOT_FOUND",
                    message:
                      "Unable to update special permit. No special permit found.",
                  },
                  {
                    error: "ERR_UPDATING_SPECIAL_PERMIT",
                    message:
                      "Unable to update special permit. Something went wrong.",
                  },
                ],
                103502: [
                  {
                    error: "ERR_NAME_IS_EMPTY",
                    message:
                      "Unable to create special permit. Name is required.",
                  },
                  {
                    error: "ERR_NAME_ALREADY_EXISTS",
                    message:
                      "Unable to update special permit. Name is already exists.",
                  },
                ],
              },
            },
            formStructure: [
              {
                name: "name",
                label: "Name",
                type: "string",
                validate: {
                  required: true,
                },
              },
            ],
            afterSave: () => {
              history.push("/speacial-permits");
            },
            onCancel: () => {
              history.push("/speacial-permits");
            },
          },
        }}
      />
    </div>
  );
};

export default SpecialPermits;
