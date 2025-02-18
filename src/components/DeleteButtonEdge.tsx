import { usePosition } from '@kaoto/hooks';
import { StepsService } from '@kaoto/services';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IVizStepNode } from '@kaoto/types';
import { Button, Popover, Tooltip } from '@patternfly/react-core';
import { MinusIcon } from '@patternfly/react-icons';
import { ReactNode } from 'react';
import { EdgeText, getBezierPath, Position, useReactFlow } from 'reactflow';
import './CustomEdge.css';
import { OrangeExclamationTriangleIcon } from './Icons';

const foreignObjectSize = 40;

export interface IDeleteButtonEdge {
  data?: any;
  id: string;
  label?: ReactNode;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position | undefined;
  targetPosition: Position | undefined;
  style?: any;
  markerEnd?: string;
}

/* PLUS BUTTON TO INSERT STEP */
const DeleteButtonEdge = ({
  id,
  label,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: IDeleteButtonEdge) => {
  // substring is used to remove the 'e-' from the id (i.e. e-{nodeId}>{nodeId})
  const nodeIds = id.substring(2).split('>');
  const sourceNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[0]);
  const targetNode: IVizStepNode | undefined = useReactFlow().getNode(nodeIds[1]);
  const integrationJsonStore = useIntegrationJsonStore();
  const nestedStepsStore = useNestedStepsStore();
  const visualizationStore = useVisualizationStore();
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);

  const { tooltipPosition } = usePosition();
  const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDeleteBranch = () => {
    // we will modify source node, and target node has the branchInfo we need
    stepsService.deleteBranch(sourceNode?.data.step, targetNode?.data.branchInfo.branchUuid);
  };

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={edgeCenterX - foreignObjectSize / 2}
        y={edgeCenterY - foreignObjectSize / 2}
        className="deleteButton-foreignObject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <span>
          <Popover
            appendTo={() => document.body}
            aria-label="Search for a step"
            headerContent={
              <div>
                <OrangeExclamationTriangleIcon /> Confirm Delete
              </div>
            }
            bodyContent={
              <section data-testid={'confirmDeleteBranchDialog'} className={'nodrag'}>
                <p>
                  Are you sure you would like to proceed and delete this branch? This action is not
                  reversible.
                </p>
                <br />
                <Button
                  data-testid={'confirmDeleteBranchDialog__btn'}
                  variant={'primary'}
                  onClick={handleDeleteBranch}
                >
                  Delete
                </Button>
              </section>
            }
            enableFlip={true}
            flipBehavior={['top-start', 'left-start']}
            hideOnOutsideClick={true}
            position={'right-start'}
          >
            <Tooltip
              content={'Delete branch'}
              position={tooltipPosition}
            >
              <button className="deleteButton" data-testid={'stepNode__deleteBranch-btn'}>
                <MinusIcon />
              </button>
            </Tooltip>
          </Popover>
        </span>
      </foreignObject>
      {label && (
        <EdgeText
          x={edgeCenterX + foreignObjectSize / 2}
          y={edgeCenterY + foreignObjectSize / 2}
          label={label}
        />
      )}
    </>
  );
};

export { DeleteButtonEdge };
